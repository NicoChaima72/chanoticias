module.exports = {
  index: async (req,res ) => {
    return res.render("home.html");
  },
  showNews: async (req,res) => {
    return res.render('pages/news/show.html');
  },
  showCategory: async (req,res) => {
    return res.render('pages/categories/show.html');
  },
  showTag: async (req,res) => {
    return res.render('pages/tags/show.html');
  }
}