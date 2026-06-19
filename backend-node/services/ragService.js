const axios = require("axios");

exports.queryRag = async (query) => {

    const response = await axios.post(
        "http://localhost:8000/query",
        {
            query
        }
    );

    return response.data.answer;
};