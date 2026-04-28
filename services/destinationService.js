const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAllDestinations = async (filters = {}) => {
  const { search, locationType, status } = filters;
  
  const where = {
    isActive: true
  };
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { fullAddress: { contains: search, mode: 'insensitive' } },
      { contact: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  if (locationType) {
    where.locationType = locationType;
  }
  
  if (status) {
    where.status = status;
  }
  
  return await prisma.deliveryDestination.findMany({
    where,
    orderBy: [
      { locationType: 'asc' },
      { name: 'asc' }
    ]
  });
};

const getDestinationById = async (id) => {
  return await prisma.deliveryDestination.findUnique({
    where: { 
      id,
      isActive: true 
    }
  });
};

const createDestination = async (destinationData) => {
  return await prisma.deliveryDestination.create({
    data: {
      ...destinationData,
      isActive: true
    }
  });
};

const updateDestination = async (id, updateData) => {
  return await prisma.deliveryDestination.update({
    where: { id },
    data: updateData
  });
};

const deleteDestination = async (id) => {
  return await prisma.deliveryDestination.update({
    where: { id },
    data: { isActive: false }
  });
};

module.exports = {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination
};
