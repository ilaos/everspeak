import { randomUUID } from 'crypto';

const examples = new Map();

examples.set('1', {
  id: '1',
  name: 'Sample Example',
  description: 'This is a sample example item',
  createdAt: new Date().toISOString()
});

export const exampleController = {
  getAll: (req, res) => {
    const allExamples = Array.from(examples.values());
    res.json({
      success: true,
      data: allExamples,
      count: allExamples.length
    });
  },

  getById: (req, res, next) => {
    try {
      const { id } = req.params;
      const example = examples.get(id);
      
      if (!example) {
        return res.status(404).json({
          success: false,
          message: 'Example not found'
        });
      }
      
      res.json({
        success: true,
        data: example
      });
    } catch (error) {
      next(error);
    }
  },

  create: (req, res, next) => {
    try {
      const { name, description } = req.body;
      
      const newExample = {
        id: randomUUID(),
        name,
        description: description || '',
        createdAt: new Date().toISOString()
      };
      
      examples.set(newExample.id, newExample);
      
      res.status(201).json({
        success: true,
        data: newExample,
        message: 'Example created successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  update: (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      
      const example = examples.get(id);
      
      if (!example) {
        return res.status(404).json({
          success: false,
          message: 'Example not found'
        });
      }
      
      const updatedExample = {
        ...example,
        name: name || example.name,
        description: description !== undefined ? description : example.description,
        updatedAt: new Date().toISOString()
      };
      
      examples.set(id, updatedExample);
      
      res.json({
        success: true,
        data: updatedExample,
        message: 'Example updated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  delete: (req, res, next) => {
    try {
      const { id } = req.params;
      
      if (!examples.has(id)) {
        return res.status(404).json({
          success: false,
          message: 'Example not found'
        });
      }
      
      examples.delete(id);
      
      res.json({
        success: true,
        message: 'Example deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};
