const {
  queryRag
} = require("../services/ragService");

exports.askQuestion = async (req, res) => {

    const { query } = req.body;

    const answer = await queryRag(query);

    res.json({
        answer
    });
};
