// Minimal Express req/res doubles shared by controller tests.
const mockReq = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

module.exports = { mockReq, mockRes };
