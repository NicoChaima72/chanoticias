const { uploadImage } = require("../../services/images.service");

module.exports = {
  upload: async (req, res) => {
    const file = req.files;

    return res.json({ ok: true, file });

    try {
      const result = await uploadImage(file);
      return res.json({
        ok: true,
        result: result.Data,
      });
    } catch (err) {
      return res.status(400).json({ ok: false, err });
    }
  },
};
