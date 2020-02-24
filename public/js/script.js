
(function() {
    console.log("sanity check!!!");
    new Vue({
        el: '#main',
        data: { // these properties are reactive
            images: []
            // cohort: "Allspice",
            // name: {
            //     first: "Alperen",
            //     last: "Kan"
            // },
            // seen: true,
            // cities: []
        },
        mounted: function() {
            var me = this;
            axios.get("/images").then(function(response) {
                console.log("get images:", response);
                me.images = response.data;
            });
            // console.log("My Vue Component has mounted");
            // this.cities.push("hello");
            // console.log("This.cities after push:", this.cities);
            // console.log("this.cities from data: ", this.cities);
            // this.cities.pop();

            // we need to store this in another variable so it doesnt
            // get overwritten
            // var me = this;
            //
            // axios.get("/cities").then(function(response) {
            //     console.log("response from /cities:", response);
            //     console.log("Berlin: ", response.data[0].name);
            //     // console.log("this.cities:", this.cities);
            //     // this.cities = response.data;
            //     // response.data is where the info lives...
            //     me.cities = response.data;
            // });
        },
        methods: {
            // muffin: function(cityName) {
            //     console.log("Muffin is running!!!", cityName);
            // }
        }
    });

}());
