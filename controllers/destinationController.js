const destinationService = require('../services/destinationService');

const getAllDestinations = async (req, res) => {
  try {
    const { search, locationType, status } = req.query;
    const destinations = await destinationService.getAllDestinations({
      search,
      locationType,
      status
    });
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;
    const destination = await destinationService.getDestinationById(id);
    
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    
    res.json(destination);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createDestination = async (req, res) => {
  try {
    const destinationData = req.body;
    const destination = await destinationService.createDestination(destinationData);
    res.status(201).json(destination);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const destination = await destinationService.updateDestination(id, updateData);
    
    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    
    res.json(destination);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await destinationService.deleteDestination(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    
    res.json({ message: 'Destination deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination
};
