const { Op } = require("sequelize");
const News = require("../../models/news.model");
const Saved_News = require("../../models/saved_news.model");
const User = require("../../models/user.model");
const { uploadImage } = require("../../services/images.service");

module.exports = {
  saved: async (req, res) => {
    const { news_id } = req.params;
    const { action } = req.body;

    const news = await Saved_News.findAll({ include: [News, User] });

    if (action == 1) {
      await Saved_News.findOrCreate({
        defaults: {
          NewsId: news_id,
          UserId: req.user.id,
        },
        where: { [Op.and]: [{ UserId: req.user.id }, { NewsId: news_id }] },
      });
    } else
      await Saved_News.destroy({
        where: { NewsId: news_id, UserId: req.user.id },
      });

    return res.json({ ok: true, body: req.body });
  },
};
