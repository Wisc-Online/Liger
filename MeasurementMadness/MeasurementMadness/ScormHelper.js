/// <reference path="SCORM_API_wrapper.js" />
if (typeof ScormHelper === 'undefined') {
    ScormHelper = (function (scorm) {
        scorm.handleExitMode = false;


        function centisecsToISODuration(n, bPrecise) {
            // Note: SCORM and IEEE 1484.11.1 require centisec precision
            // Parameters:
            // n = number of centiseconds
            // bPrecise = optional parameter; if true, duration will
            // be expressed without using year and/or month fields.
            // If bPrecise is not true, and the duration is long,
            // months are calculated by approximation based on average number
            // of days over 4 years (365*4+1), not counting the extra days
            // for leap years. If a reference date was available,
            // the calculation could be more precise, but becomes complex,
            // since the exact result depends on where the reference date
            // falls within the period (e.g. beginning, end or ???)
            // 1 year ~ (365*4+1)/4*60*60*24*100 = 3155760000 centiseconds
            // 1 month ~ (365*4+1)/48*60*60*24*100 = 262980000 centiseconds
            // 1 day = 8640000 centiseconds
            // 1 hour = 360000 centiseconds
            // 1 minute = 6000 centiseconds
            var str = "P";
            var nCs = n;
            var nY = 0, nM = 0, nD = 0, nH = 0, nMin = 0, nS = 0;
            n = Math.max(n, 0); // there is no such thing as a negative duration
            var nCs = n;
            // Next set of operations uses whole seconds
            with (Math) {
                nCs = round(nCs);
                if (bPrecise == true) {
                    nD = floor(nCs / 8640000);
                }
                else {
                    nY = floor(nCs / 3155760000);
                    nCs -= nY * 3155760000;
                    nM = floor(nCs / 262980000);
                    nCs -= nM * 262980000;
                    nD = floor(nCs / 8640000);
                }
                nCs -= nD * 8640000;
                nH = floor(nCs / 360000);
                nCs -= nH * 360000;
                var nMin = floor(nCs / 6000);
                nCs -= nMin * 6000
            }
            // Now we can construct string
            if (nY > 0) str += nY + "Y";
            if (nM > 0) str += nM + "M";
            if (nD > 0) str += nD + "D";
            if ((nH > 0) || (nMin > 0) || (nCs > 0)) {
                str += "T";
                if (nH > 0) str += nH + "H";
                if (nMin > 0) str += nMin + "M";
                if (nCs > 0) str += (nCs / 100) + "S";
            }
            if (str == "P") str = "PT0H0M0S";
            // technically PT0S should do but SCORM test suite assumes longer form.
            return str;
        }

        var readWrite = function (name) {
            return function (value) {
                if (arguments.length == 0) {
                    return scorm.get(name);
                }

                return scorm.set(name, value);
            }
        };


        function toScormTimeStamp(dateTime) {
            var timeString = dateTime.getUTCFullYear() + "-" +
                        ('0' + (1 + dateTime.getUTCMonth())).slice(-2) + "-" +
                        ('0' + dateTime.getUTCDate()).slice(-2) + "T" +
                        ('0' + dateTime.getUTCHours()).slice(-2) + ":" +
                        ('0' + dateTime.getUTCMinutes()).slice(-2) + ":" +
                        ('0' + dateTime.getUTCSeconds()).slice(-2);

            return timeString;
        };

        function fromScormTimeStamp(timeString) {
            var parts = (timeString).match(/\d+/g);

            var date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]));

            return date;
        }


        var readOnly = function (name) {
            return function () {
                return scorm.get(name);
            };
        }

        var writeOnly = function (name) {
            return function (value) {
                return scorm.set(name, value)
            };
        }


        function Comment(data) {
            var self = this;
            self.originalValues = data || {};

            self.comment = data.comment;
            self.timestamp = data.timestamp;
            self.location = data.location;
            self.n = data.n;

        }

        Comment.prototype.save = function () {

            var prefix = this._prefix + this.n.toString();

            if (this.originalValues.comment != this.comment) {
                scorm.set(prefix + ".comment", this.comment)
            }

            if (this.originalValues.location != this.location) {
                scorm.set(prefix + ".location", this.location)
            }

            if (this.originalValues.timestamp != this.timestamp) {
                scorm.set(prefix + ".timestamp", this.timestamp)
            }
        };


        function CommentsFromLearner() {
            var self = this;

            self.count = parseInt(scorm.get("cmi.comments_from_learner._count"));
            self.children = scorm.get("cmi.comments_from_learner._children");

            var _comments = {};

            self.get = function (n) {
                if (_comments[n]) {
                    return _comments[n];
                }

                if (n < 0 || n >= self.count) {
                    throw "n must be be between 0 and " + (self.count - 1);
                }

                var prefix = "cmi.comments_from_learner." + n;

                var commentData = {
                    n: n,
                    comment: scorm.get(prefix + ".comment"),
                    location: scorm.get(prefix + ".location"),
                    timestamp: scorm.get(prefix + ".timestamp")
                };

                var comment = new Comment(commentData);

                comment._prefix = "cmi.comments_from_learner.";

                _comments[n] = comment;

                return comment;
            };

            self.save = function () {
                for (var key in _comments) {
                    _comments[key].save();
                }
            };

            self.new = function () {
                var comment = new Comment({ n: self.count })

                comment.timestamp = toScormTimeStamp(new Date());

                comment._prefix = "cmi.comments_from_learner.";

                _comments[self.count] = comment;

                self.count++;

                return comment;
            }
        }

        function CommentsFromLms() {
            var self = this;

            self.count = parseInt(scorm.get("cmi.comments_from_lms._count"));
            self.children = scorm.get("cmi.comments_from_lms._children");

            var _comments = {};

            self.get = function (n) {
                if (_comments[n]) {
                    return _comments[n];
                }

                if (n < 0 || n >= self.count) {
                    throw "n must be be between 0 and " + (self.count - 1);
                }

                var prefix = "cmi.comments_from_lms." + n;

                var comment = {
                    n: n,
                    comment: scorm.get(prefix + ".comment"),
                    location: scorm.get(prefix + ".location"),
                    timestamp: scorm.get(prefix + ".timestamp")
                };

                _comments[n] = comment;

                return comment;
            };
        }

        function Interaction(data) {

            var self = this;
            self._originalValues = data || {};

            self.n = data.n;
            self.id = data.id;
            self.type = data.type;
            self.timestamp = data.timestamp;
            self.learnerResponse = data.learnerResponse;
            self.result = data.result;
            self.latency = data.latency;
            self.description = data.description;
        }



        Interaction.prototype.save = function () {

            if (!this.latency)
                this.stop();

            var prefix = "cmi.interactions." + this.n.toString();

            if (this._originalValues.id != this.id) {
                scorm.set(prefix + ".id", this.id)
            }

            if (this._originalValues.type != this.type) {
                scorm.set(prefix + ".type", this.type)
            }

            if (this._originalValues.timestamp != this.timestamp) {
                scorm.set(prefix + ".timestamp", this.timestamp)
            }

            if (this._originalValues.learnerResponse != this.learnerResponse) {
                scorm.set(prefix + ".learner_response", this.learnerResponse)
            }

            if (this._originalValues.result != this.result) {
                scorm.set(prefix + ".result", this.result)
            }

            if (this._originalValues.latency != this.latency) {
                scorm.set(prefix + ".latency", this.latency)
            }

            if (this._originalValues.description != this.description) {
                scorm.set(prefix + ".description", this.description)
            }
        };

        Interaction.prototype.start = function (date) {
            date = date || new Date();

            this.timestamp = toScormTimeStamp(date);
        }

        Interaction.prototype.stop = function (date) {
            date = date || new Date();

            var startDate = fromScormTimeStamp(this.timestamp || date);

            this.latency = centisecsToISODuration((date - startDate) / 10);
        }


        function Interactions() {
            var self = this;

            self.count = parseInt(scorm.get("cmi.interactions._count"));
            self.children = scorm.get("cmi.interactions._children");

            var _interactions = {};

            self.get = function (n) {
                if (_interactions[n]) {
                    return _interactions[n];
                }

                if (n < 0 || n >= self.count) {
                    throw "n must be be between 0 and " + (self.count - 1);
                }

                var prefix = "cmi.interactions." + n;

                var interactionData = {
                    n: n,
                    id: scorm.get(prefix + ".id"),
                    type: scorm.get(prefix + ".type"),
                    timestamp: scorm.get(prefix + ".timestamp"),
                    learnerResponse: scorm.get(prefix + ".learner_response"),
                    result: scorm.get(prefix + ".result"),
                    latency: scorm.get(prefix + ".latency"),
                    description: scorm.get(prefix + ".description")
                };

                var interaction = new Interaction(interactionData);

                _interactions[n] = interaction;

                return interaction;
            };

            self.save = function () {
                for (var key in _interactions) {
                    _interactions[key].save();
                }
            };

            self.new = function () {
                var interaction = new Interaction({ n: self.count })

                interaction.timestamp = toScormTimeStamp(new Date());

                interaction._prefix = "cmi.comments_from_learner.";

                _interactions[self.count] = interaction;

                self.count++;

                return interaction;
            }
        }


        function Objective(data) {
            var self = this;
            self._originalValues = data || {};

            self.id = data.id;
            self.successStatus = data.successStatus;
            self.completionStatus = data.completionStatus;
            self.progressMeasure = data.progressMeasure;
            self.description = data.description;
        }

        function Objectives() {
            var self = this;

            self.count = parseInt(scorm.get("cmi.objectives._count"));
            self.children = scorm.get("cmi.objectives._children");

            var _objectives = {};

            self.get = function (n) {
                if (_objectives[n]) {
                    return _objectives[n];
                }

                if (n < 0 || n >= self.count) {
                    throw "n must be be between 0 and " + (self.count - 1);
                }

                var prefix = "cmi.objectives." + n;

                var objectiveData = {
                    n: n,
                    id: scorm.get(prefix + ".id"),
                    score: {
                        children: readOnly(prefix + ".score._children"),
                        scaled: readWrite(prefix + ".score.scaled"),
                        raw: readWrite(prefix + ".score.raw"),
                        min: readWrite(prefix + ".score.min"),
                        max: readWrite(prefix + ".score.max")
                    },
                    successStatus: scorm.get(prefix + ".success_status"),
                    completionStatus: scorm.get(prefix + ".completion_status"),
                    progressMeasure: scorm.get(prefix + ".progress_measure"),
                    description: scorm.get(prefix + ".description")
                };

                var objective = new Objective(objectiveData);

                _objectives[n] = objective;

                return objective;
            };

            self.save = function () {
                for (var key in _objectives) {
                    _objectives[key].save();
                }
            };

            self.new = function () {
                var objective = new Objective({ n: self.count })

                comment._prefix = "cmi.comments_from_learner.";

                _objectives[self.count] = comment;

                self.count++;

                return comment;
            }
        }

        var helper = {
            cmi: {
                version: readOnly("cmi._version"),
                commentsFromLearner: function () {
                    return new CommentsFromLearner();
                },
                commentsFromLms: function () {
                    return new CommentsFromLms();
                },
                completionStatus: readWrite("cmi.completion_status"),
                completionThreshold: readOnly("cmi.completion_threshold"),
                credit: readOnly("cmi.credit"),
                exit: writeOnly("cmi.exit"),
                interactions: function () {
                    if (!this._interactions)
                        this._interactions = new Interactions();

                    return this._interactions;
                },
                launchData: readOnly("cmi.launch_data"),
                learner: {
                    id: readOnly("cmi.learner_id"),
                    name: readOnly("cmi.learner_name"),
                    preferences: {
                        audioLevel: readWrite("cmi.learner_preference.audio_level"),
                        language: readWrite("cmi.learner_preference.language"),
                        deliverySpeed: readWrite("cmi.learner_preference.delivery_speed"),
                        audioCaptioning: readWrite("cmi.learner_preference.audio_captioning")
                    }
                },
                location: readWrite("cmi.location"),
                maxTimeAllowed: readOnly("cmi.max_time_allowed"),
                mode: readOnly("cmi.mode"),
                objectives: function () {
                    throw "Not implemented yet!";
                },
                progressMeasure: readWrite("cmi.progress_measuer"),
                scaledPassingScore: readOnly("cmi.scaled_passing_score"),
                score: {
                    scaled: readWrite("cmi.score.scaled"),
                    raw: readWrite("cmi.score.raw"),
                    min: readWrite("cmi.score.min"),
                    max: readWrite("cmi.score.max")
                },
                sessionTime: writeOnly("cmi.session_time"),
                successStatus: readWrite("cmi.success_status"),
                suspendData: readWrite("cmi.suspend_data"),
                timeLimitAction: readOnly("cmi.time_limit_action"),
                totalTime: readOnly("cmi.total_time")
            },
            adl: {
                nav: {
                    request: readWrite("adl.nav.request"),
                    requestValid: {
                        "continue": readOnly("adl.nav.request_valid.continue"),
                        previous: readOnly("adl.nav.request_valid.previous"),
                        choice: function (target) {
                            var parm = "adl.nav.request_valid.choice.target=" + target;

                            return scorm.get(parm);
                        },
                        jump: function (target) {
                            var parm = "adl.nav.request_valid.jump.target=" + target;

                            return scorm.get(parm);
                        }
                    }
                }
            },
            interactions: {
                trueFalse: "true-false",
                choice: "choice",
                fillIn: "fill-in",
                matching: "matching",
                performance: "performance",
                sequencing: "sequencing",
                likert: "likert",
                numeric: "numeric",
                other: "other"
            },
            results: {
                correct: "correct",
                incorrect: "incorrect",
                unanticipated: "unanticipated",
                neutral: "neutral"
            },
            exitStatus: {
                timeout: "timeout",
                suspend: "suspend",
                logout: "logout",
                normal: "normal"
            },
            completionStatus: {
                completed: "completed",
                incomplete: "incomplete",
                notAttempted: "not attempted",
                unknown: "unknown"
            },
            successStatus: {
                passed: "passed",
                failed: "failed",
                unknown: "unknown"
            }
        };

        helper.initialize = scorm.init;
        helper.commit = scorm.save;
        helper.terminate = scorm.quit;

        return helper;
    })(pipwerks.SCORM);
}