export const login = (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    req.session.authenticated = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ ok: false, message: '密码错误' });
};

export const logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
};
