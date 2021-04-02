const server = {
    PORT: 3000,
    NAME: "STORYCARDS BACKEND",
    CLIENTS: [
        "*",
        "http://storycards.dev.s3-website-us-west-2.amazonaws.com/",
        "http://storycardsfront.eba-3w7npwge.us-west-2.elasticbeanstalk.com/",
        "http://localhost:8100",
        "http://storycards.upc.edu.pe",
        "https://storycards.upc.edu.pe",
        "http://localhost:8080"
    ]
}

module.exports = {
    server
}
