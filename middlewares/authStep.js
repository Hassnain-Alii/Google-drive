exports.requireStep = (flow, step) => (req, res, next) => {
  const map = {
    signin: {
      names: () => req.session.user?.firstname,
      basicInfo: () => req.session.birthDate && req.session.gender,
      username: () => req.session.email,
      password: () => req.session.email,
    },
    login: {
      email: () => req.session.email,
      password: () => req.session.email,
    },
  };
  if (!map[flow]?.[step]?.()) {
    const back =
      Object.keys(map[flow]).find((k) => map[flow][k]() === undefined) ||
      Object.keys(map[flow])[0];
    return res.redirect(`/users/${flow}/${back}`);
  }
  next();
};
