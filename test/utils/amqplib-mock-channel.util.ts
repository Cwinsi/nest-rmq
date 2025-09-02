import amqplib from "amqplib";

export const getMockChannelAndConnection = () => {
  const mockChannel = {
    assertQueue: jest.fn(),
    bindQueue: jest.fn(),
    consume: jest.fn(),
    ack: jest.fn(),
    nack: jest.fn(),
    assertExchange: jest.fn(),
    publish: jest.fn(),
    on: jest.fn()
  };

  const mockConnection = {
    createChannel: jest.fn().mockResolvedValue(mockChannel),
  };

  (amqplib.connect as jest.Mock).mockResolvedValue(mockConnection);

  return { mockChannel, mockConnection };
};
