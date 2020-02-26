
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
            console.log("vue.component mounted");
            console.log("this.id:", this.id);
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
        methods: {
            handleClick: function() {
                console.log(this);

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
            }
        }
    });

    new Vue({
        el: '#main',
        data: { // these properties are reactive
            id: null,
            images: [],
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
                })
                .catch(function(error) {
                    console.log("error in GET /images:", error);
                });
        },
        methods: {

            handleClick: function(e) {
                e.preventDefault();
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

            handleChange: function(e) {
                // this runs when user selects an img in the file input field
                console.log("handleChange is running");
                console.log("file:", e.target.files[0]);

                this.file = e.target.files[0];
                console.log("this:", this);
            },

            // handleMessage: function(e) {
            //     if (this.id) {
            //         this.id = null;
            //     } else {
            //         this.id = e.target.src;
            //     }
            // },

            openModal: function(imageId) {
                this.id = imageId;
                // console.log(this.id);
            },

            handleClose: function() {
                this.id = null;
            },

            deleteImage: function(e) {
                e.preventDefault();
                var url = e.target.src;
                var myData = this;


                axios.post("/delete", {
                    url: url
                })
                    .then(function(response) {
                        console.log("POST /delete response:", response);

                        for (var i = 0; i < myData.images.length; i++) {
                            if (myData.images[i].url == url) {
                                myData.images.splice(i, 1);
                                console.log(myData.images);
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
