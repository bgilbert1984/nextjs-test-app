const dat = {
    GUI: jest.fn().mockImplementation(() => ({
      addFolder: jest.fn().mockReturnValue({
        add: jest.fn(),
        addColor: jest.fn(),
      }),
    })),
  };
  
  module.exports = dat;
  