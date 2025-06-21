const { DataTypes } = require('sequelize');
const sequelize = require('../db/config');

const Setlist = sequelize.define('setlist', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  band_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'bands',
      key: 'id'
    }
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'setlists',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define associations
Setlist.associate = (models) => {
  Setlist.belongsTo(models.Band, { 
    foreignKey: 'band_id',
    as: 'band'
  });
  
  Setlist.belongsTo(models.User, { 
    foreignKey: 'created_by',
    as: 'creator'
  });
  
  Setlist.hasMany(models.Block, { 
    foreignKey: 'setlist_id',
    as: 'blocks'
  });
  
  Setlist.hasMany(models.SetlistSong, { 
    foreignKey: 'setlist_id',
    as: 'setlist_songs'
  });
};

module.exports = Setlist;