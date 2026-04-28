const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAllActiveOrders = async (filters = {}) => {
  const { search, status, destinationId } = filters;
  
  const where = {
    isActive: true,
    status: {
      not: 'DELIVERED'
    }
  };
  
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { transaction: { remarks: { contains: search, mode: 'insensitive' } } },
      { destination: { name: { contains: search, mode: 'insensitive' } } },
      { destination: { fullAddress: { contains: search, mode: 'insensitive' } } }
    ];
  }
  
  if (status && status !== 'ALL') {
    where.status = status;
  }
  
  if (destinationId) {
    where.destinationId = destinationId;
  }
  
  return await prisma.order.findMany({
    where,
    include: {
      transaction: {
        include: {
          user: {
            select: {
              name: true,
              username: true
            }
          },
          product: {
            select: {
              name: true,
              sku: true,
              category: true
            }
          }
        }
      },
      destination: true
    },
    orderBy: [
      { status: 'asc' },
      { createdAt: 'desc' }
    ]
  });
};

const getOrderById = async (id) => {
  return await prisma.order.findUnique({
    where: { 
      id,
      isActive: true 
    },
    include: {
      transaction: {
        include: {
          user: {
            select: {
              name: true,
              username: true
            }
          }
        }
      },
      destination: true
    }
  });
};

const createOrder = async (orderData) => {
  // Generate unique order number
  const orderNumber = generateOrderNumber();
  
  return await prisma.order.create({
    data: {
      ...orderData,
      orderNumber,
      isActive: true
    },
    include: {
      transaction: {
        include: {
          user: {
            select: {
              name: true,
              username: true
            }
          }
        }
      },
      destination: true
    }
  });
};

const updateOrder = async (id, updateData) => {
  return await prisma.order.update({
    where: { id },
    data: updateData,
    include: {
      transaction: {
        include: {
          user: {
            select: {
              name: true,
              username: true
            }
          }
        }
      },
      destination: true
    }
  });
};

const updateOrderStatus = async (id, status) => {
  const updateData = { status };
  
  // If status is DELIVERED, set actual delivery date
  if (status === 'DELIVERED') {
    updateData.actualDeliveryDate = new Date();
  }
  
  return await prisma.order.update({
    where: { id },
    data: updateData,
    include: {
      transaction: {
        include: {
          user: {
            select: {
              name: true,
              username: true
            }
          }
        }
      },
      destination: true
    }
  });
};

const deleteOrder = async (id) => {
  return await prisma.order.update({
    where: { id },
    data: { isActive: false }
  });
};

// Helper function to generate unique order numbers
function generateOrderNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
}

module.exports = {
  getAllActiveOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder
};
