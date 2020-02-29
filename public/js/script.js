
(function() {
    Vue.component("my-component", {
        template: "#my-component",
        props: ["id", "valid"],
        data: function() {
            return {
                comments: [],
                image: {},
                tags: [],
                username: "",
                comment: "",
            };
        },
        mounted: function() {
            console.log("component mounted");
            this.getData();
        },
        watch: {
            id: function() {
                console.log("the id has changed:", this.id);
                this.getData();
            }
        },
        methods: {
            getData: function() {
                var me = this;

                axios.post("/data", { id: me.id })
                    .then(function(response) {
                        console.log("response.data:", response.data);
                        if (response.data[0]) {
                            me.emitValid();
                            me.image = response.data[0];
                            me.comments = response.data[1];
                            me.tags = response.data[2];
                            console.log("axios.post /data", me);
                        } else {
                            me.closeModal();
                        }

                    })
                    .catch(function(error) {
                        console.log("error in POST /getdata:", error);
                        me.closeModal();
                    });
            },

            submitComment: function() {
                var me = this;

                axios.post("/comment", {
                    username: me.username,
                    comment: me.comment,
                    imageId: me.id
                })
                    .then(function(response) {
                        console.log("response:", response);
                        me.comments.unshift(response.data);
                    })
                    .catch(function(error) {
                        console.log("error in POST /comment:", error);
                    });
            },

            closeModal: function() {
                this.$emit("close");
            },

            emitDelete: function() {
                this.$emit("delete");
            },

            emitPrev: function() {
                this.$emit("prev");
            },

            emitNext: function() {
                this.$emit("next");
            },
            emitValid: function() {
                this.$emit("valid");
            }
        }
    });

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////
    new Vue({
        el: '#main',
        data: { // these properties are reactive
            images: [],
            id: location.hash.slice(1),
            valid: "",
            lastId: "",
            lowestId: "",
            tag: null,
            more: null,
            // data properties will store the values of our input fields
            title: "",
            description: "",
            username: "",
            tags: "",
            file: null
        },
        watch: {
            tag: function() {
                if (this.tag) {
                    this.id = null;
                    this.more = null;
                    this.getImages();
                }
            }
        },
        mounted: function() {
            console.log("vue instance mounted");
            // check if id or tag
            if ( location.hash.slice(1) && !Number.isInteger(parseInt(location.hash.slice(1))) ) {
                this.tag = location.hash.slice(1);
            }
            this.getImages(true);

        },
        methods: {
            getImages: function(listen=false) {
                var me = this;
                axios.post("/images", {tag: me.tag})
                    .then(function(response) {
                        me.images = response.data;
                        me.lastId = me.images[me.images.length-1].id;
                        me.lowestId = me.images[0].lowestId;

                        // checking if there are more images
                        if (me.lastId > me.lowestId) {
                            me.more = true;
                        }

                        if (listen) {
                            addEventListener("hashchange", function() {
                                if (!location.hash) {
                                    me.handleClose();
                                    me.getImages(false);
                                } else if (Number.isInteger(parseInt(location.hash.slice(1)))) {
                                    me.tag = null;
                                    me.id = location.hash.slice(1);
                                } else {
                                    me.tag = location.hash.slice(1);
                                }
                            });
                        }
                    })
                    .catch(function(error) {
                        console.log("error in GET /images:", error);
                    });
            },

            submitImage: function() {
                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("tags", this.tags);
                formData.append("file", this.file);

                var me = this;

                axios.post("/upload", formData)
                    .then(function(response) {
                        console.log("response from POST /upload:", response);
                        me.title = "";
                        me.username = "";
                        me.description = "";
                        me.tags = "";
                        me.file = null;

                        me.images.unshift(response.data);
                    })
                    .catch(function(error) {
                        console.log("error in POST /upload:", error);
                    });
            },

            readFile: function(e) {
                // this runs when user selects an img in the file input field
                console.log("readFile is running");
                console.log("file:", e.target.files[0]);

                this.file = e.target.files[0];
                console.log("this:", this);
            },

            handleClose: function() {
                this.valid = null;
                this.id = null;
                history.replaceState(null, null, " ");
            },

            getMoreImages: function() {
                console.log("loading more images");
                var me = this;
                axios.post("/moreimages", {
                    tag: me.tag,
                    lastId: me.lastId
                })
                    .then(function(response) {
                        console.log("getMoreImages:", response.data);
                        me.images.push.apply(me.images, response.data);

                        me.lastId = me.images[me.images.length-1].id;
                        me.lowestId = me.images[me.images.length-1].lowestId;
                        if (me.lastId == me.lowestId) {
                            me.more = null;
                        }
                    })
                    .catch(function(error) {
                        console.log("error in POST /moreimages:", error);
                    });
            },

            handleDelete: function() {
                var me = this;
                console.log("delete req received for imageId:", me.id);

                axios.post("/delete", {
                    imageId: me.id
                })
                    .then(function(response) {
                        console.log("POST /delete response:", response);

                        for (var i = 0; i < me.images.length; i++) {
                            if (me.images[i].id == me.id) {
                                me.handleClose();
                                return me.images.splice(i, 1);
                            }
                        }

                    })
                    .catch(function(error) {
                        console.log("error in POST /delete:", error);
                    });
            },

            handlePrev: function() {
                this.id = this.previd;
            },

            handleNext: function() {
                this.id = this.nextid;
            },

            handleValid: function() {
                this.valid = true;
            }
        }
    });

}());
