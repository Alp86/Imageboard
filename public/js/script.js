
(function() {
    console.log("sanity check!!!");
    new Vue({
        el: '#main',
        data: { // these properties are reactive
            images: [],
            // data properties will store the values of our input fields
            title: "",
            description: "",
            username: "",
            file: null
        },
        mounted: function() {
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
            }
        }
    });

}());
