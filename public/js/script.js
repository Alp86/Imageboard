
(function() {
    Vue.component("my-component", {
        template: "#my-component",
        props: ["id"],
        data: function() {
            return {
                comments: [],
                image: {},
                username: "",
                comment: "",
            };
        },
        mounted: function() {
            this.getData();
            // console.log("vue.component mounted");
            // console.log("this.id:", this.id);
            // var me = this;
            //
            // axios.post("/data", { id: me.id })
            //     .then(function(response) {
            //         // console.log(response);
            //         me.image = response.data[0];
            //         me.comments = response.data[1];
            //         console.log("axios.post /data", me);
            //     })
            //     .catch(function(error) {
            //         console.log("error in POST /getdata:", error);
            //     });
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
                        // console.log(response);
                        me.image = response.data[0];
                        me.comments = response.data[1];
                        console.log("axios.post /data", me);
                    })
                    .catch(function(error) {
                        console.log("error in POST /getdata:", error);
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
            }
        }
    });

    new Vue({
        el: '#main',
        data: { // these properties are reactive
            images: [],
            id: location.hash.slice(1),
            lastId: "",
            lowestId: "",
            more: null,
            // data properties will store the values of our input fields
            title: "",
            description: "",
            username: "",
            file: null
        },
        mounted: function() {
            console.log("vue instance mounted");
            var me = this;
            axios.get("/images")
                .then(function(response) {
                    console.log("get images:", response);
                    me.images = response.data;
                    me.lastId = me.images[me.images.length-1].id;
                    me.lowestId = me.images[0].lowestId;

                    // checking if there are more images

                    if (me.lastId > me.lowestId) {
                        me.more = true;
                    }
                })
                .catch(function(error) {
                    console.log("error in GET /images:", error);
                });
            addEventListener("hashchange", function() {
                console.log("hashchange:", location.hash);
                me.id = location.hash.slice(1);
            });
        },
        methods: {
            submitImage: function() {
                console.log("this:", this);

                var formData = new FormData();

                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);
                var myData = this;
                axios.post("/upload", formData)
                    .then(function(response) {
                        console.log("response from POST /upload:", response);
                        if (response.data.success) {
                            myData.images.unshift(response.data);
                        } else {
                            console.log("error in POST /upload response");
                        }
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
                this.id = null;
                history.replaceState(null, null, " ");
            },

            getMoreImages: function() {
                console.log("loading more images");
                var me = this;
                axios.post("/moreimages", { lastId: me.lastId })
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
                                me.images.splice(i, 1);
                                console.log("me.images after splice:", me.images);
                            }
                        }

                    })
                    .catch(function(error) {
                        console.log("error in POST /delete:", error);
                    });
            }
        }
    });

}());
