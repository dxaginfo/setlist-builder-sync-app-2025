const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const Setlist = require('../models/setlist.model');
const SetlistSong = require('../models/setlistSong.model');
const Song = require('../models/song.model');
const User = require('../models/user.model');
const Band = require('../models/band.model');
const Block = require('../models/block.model');
const SpotifyService = require('../services/spotify.service');
const PDFService = require('../services/pdf.service');
const ShareService = require('../services/share.service');
const io = require('../socket');

/**
 * Get all setlists for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllSetlists = async (req, res) => {
  try {
    // Find setlists created by the user or where user is a member of the band
    const setlists = await Setlist.findAll({
      where: {
        [Op.or]: [
          { created_by: req.user.id },
          // Include setlists where user is a band member
          { '$band.members.user_id$': req.user.id }
        ]
      },
      include: [
        {
          model: Band,
          as: 'band',
          include: [
            {
              model: User,
              as: 'members',
              attributes: ['id', 'username', 'email'],
              through: { attributes: ['role'] }
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['updated_at', 'DESC']]
    });

    res.json(setlists);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Get a setlist by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSetlistById = async (req, res) => {
  try {
    const setlist = await Setlist.findByPk(req.params.id, {
      include: [
        {
          model: Band,
          as: 'band',
          include: [
            {
              model: User,
              as: 'members',
              attributes: ['id', 'username', 'email'],
              through: { attributes: ['role'] }
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Block,
          as: 'blocks',
          include: [
            {
              model: SetlistSong,
              as: 'songs',
              include: [
                {
                  model: Song,
                  as: 'song'
                }
              ]
            }
          ]
        }
      ]
    });

    if (!setlist) {
      return res.status(404).json({ msg: 'Setlist not found' });
    }

    // Check if user has access to this setlist
    const hasAccess = setlist.created_by === req.user.id || 
                      setlist.is_public || 
                      setlist.band.members.some(member => member.id === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    res.json(setlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Create a new setlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createSetlist = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, band_id, is_public } = req.body;

  try {
    // If band_id is provided, verify user is a member of the band
    if (band_id) {
      const band = await Band.findByPk(band_id, {
        include: [
          {
            model: User,
            as: 'members',
            attributes: ['id'],
            through: { attributes: [] }
          }
        ]
      });

      if (!band) {
        return res.status(404).json({ msg: 'Band not found' });
      }

      const isMember = band.members.some(member => member.id === req.user.id);
      if (!isMember) {
        return res.status(403).json({ msg: 'You must be a member of the band to create a setlist' });
      }
    }

    const newSetlist = await Setlist.create({
      id: uuidv4(),
      name,
      description,
      band_id: band_id || null,
      created_by: req.user.id,
      is_public: is_public || false
    });

    // Emit socket event for real-time updates
    if (band_id) {
      io.to(`band:${band_id}`).emit('setlist:created', newSetlist);
    }
    io.to(`user:${req.user.id}`).emit('setlist:created', newSetlist);

    res.status(201).json(newSetlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Update a setlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateSetlist = async (req, res) => {
  const { name, description, is_public } = req.body;

  try {
    const setlist = await Setlist.findByPk(req.params.id);

    if (!setlist) {
      return res.status(404).json({ msg: 'Setlist not found' });
    }

    // Check if user has permission to update
    if (setlist.created_by !== req.user.id) {
      // Check if user is a band admin
      if (setlist.band_id) {
        const bandMember = await BandMember.findOne({
          where: {
            band_id: setlist.band_id,
            user_id: req.user.id,
            role: 'admin'
          }
        });

        if (!bandMember) {
          return res.status(403).json({ msg: 'You do not have permission to update this setlist' });
        }
      } else {
        return res.status(403).json({ msg: 'You do not have permission to update this setlist' });
      }
    }

    // Update fields
    if (name) setlist.name = name;
    if (description !== undefined) setlist.description = description;
    if (is_public !== undefined) setlist.is_public = is_public;

    await setlist.save();

    // Emit socket event for real-time updates
    if (setlist.band_id) {
      io.to(`band:${setlist.band_id}`).emit('setlist:updated', setlist);
    }
    io.to(`user:${req.user.id}`).emit('setlist:updated', setlist);

    res.json(setlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Delete a setlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteSetlist = async (req, res) => {
  try {
    const setlist = await Setlist.findByPk(req.params.id);

    if (!setlist) {
      return res.status(404).json({ msg: 'Setlist not found' });
    }

    // Check if user has permission to delete
    if (setlist.created_by !== req.user.id) {
      // Check if user is a band admin
      if (setlist.band_id) {
        const bandMember = await BandMember.findOne({
          where: {
            band_id: setlist.band_id,
            user_id: req.user.id,
            role: 'admin'
          }
        });

        if (!bandMember) {
          return res.status(403).json({ msg: 'You do not have permission to delete this setlist' });
        }
      } else {
        return res.status(403).json({ msg: 'You do not have permission to delete this setlist' });
      }
    }

    const setlistId = setlist.id;
    const bandId = setlist.band_id;

    // Delete all songs from the setlist first
    await SetlistSong.destroy({ where: { setlist_id: setlistId } });

    // Delete all blocks from the setlist
    await Block.destroy({ where: { setlist_id: setlistId } });

    // Delete the setlist
    await setlist.destroy();

    // Emit socket event for real-time updates
    if (bandId) {
      io.to(`band:${bandId}`).emit('setlist:deleted', { id: setlistId });
    }
    io.to(`user:${req.user.id}`).emit('setlist:deleted', { id: setlistId });

    res.json({ msg: 'Setlist deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Get all songs in a setlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSetlistSongs = async (req, res) => {
  try {
    const setlist = await Setlist.findByPk(req.params.id);

    if (!setlist) {
      return res.status(404).json({ msg: 'Setlist not found' });
    }

    // Check if user has access to this setlist
    const hasAccess = setlist.created_by === req.user.id || 
                      setlist.is_public || 
                      await isUserBandMember(req.user.id, setlist.band_id);

    if (!hasAccess) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const setlistSongs = await SetlistSong.findAll({
      where: { setlist_id: req.params.id },
      include: [
        {
          model: Song,
          as: 'song'
        },
        {
          model: Block,
          as: 'block'
        }
      ],
      order: [['position', 'ASC']]
    });

    res.json(setlistSongs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Add a song to a setlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.addSongToSetlist = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { song_id, position, block_id, notes } = req.body;

  try {
    const setlist = await Setlist.findByPk(req.params.id);

    if (!setlist) {
      return res.status(404).json({ msg: 'Setlist not found' });
    }

    // Check if user has permission to update
    if (setlist.created_by !== req.user.id && !await isUserBandMember(req.user.id, setlist.band_id)) {
      return res.status(403).json({ msg: 'You do not have permission to update this setlist' });
    }

    // Check if song exists
    const song = await Song.findByPk(song_id);
    if (!song) {
      return res.status(404).json({ msg: 'Song not found' });
    }

    // If block_id is provided, check if it belongs to this setlist
    if (block_id) {
      const block = await Block.findByPk(block_id);
      if (!block || block.setlist_id !== req.params.id) {
        return res.status(400).json({ msg: 'Invalid block ID' });
      }
    }

    // Create the setlist song entry
    const setlistSong = await SetlistSong.create({
      id: uuidv4(),
      setlist_id: req.params.id,
      song_id,
      position,
      block_id: block_id || null,
      notes: notes || null
    });

    // Update the setlist's updated_at timestamp
    setlist.changed('updated_at', true);
    await setlist.save();

    // Get the created setlist song with song details
    const createdSetlistSong = await SetlistSong.findByPk(setlistSong.id, {
      include: [
        {
          model: Song,
          as: 'song'
        },
        {
          model: Block,
          as: 'block'
        }
      ]
    });

    // Emit socket event for real-time updates
    if (setlist.band_id) {
      io.to(`band:${setlist.band_id}`).emit('setlist:song:added', {
        setlist_id: req.params.id,
        song: createdSetlistSong
      });
    }
    io.to(`user:${req.user.id}`).emit('setlist:song:added', {
      setlist_id: req.params.id,
      song: createdSetlistSong
    });

    res.status(201).json(createdSetlistSong);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Remove a song from a setlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.removeSongFromSetlist = async (req, res) => {
  try {
    const setlist = await Setlist.findByPk(req.params.id);

    if (!setlist) {
      return res.status(404).json({ msg: 'Setlist not found' });
    }

    // Check if user has permission to update
    if (setlist.created_by !== req.user.id && !await isUserBandMember(req.user.id, setlist.band_id)) {
      return res.status(403).json({ msg: 'You do not have permission to update this setlist' });
    }

    // Find the setlist song
    const setlistSong = await SetlistSong.findOne({
      where: {
        setlist_id: req.params.id,
        song_id: req.params.songId
      }
    });

    if (!setlistSong) {
      return res.status(404).json({ msg: 'Song not found in setlist' });
    }

    const setlistSongId = setlistSong.id;

    // Delete the setlist song
    await setlistSong.destroy();

    // Update the setlist's updated_at timestamp
    setlist.changed('updated_at', true);
    await setlist.save();

    // Emit socket event for real-time updates
    if (setlist.band_id) {
      io.to(`band:${setlist.band_id}`).emit('setlist:song:removed', {
        setlist_id: req.params.id,
        song_id: req.params.songId
      });
    }
    io.to(`user:${req.user.id}`).emit('setlist:song:removed', {
      setlist_id: req.params.id,
      song_id: req.params.songId
    });

    res.json({ msg: 'Song removed from setlist' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Reorder songs in a setlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.reorderSetlistSongs = async (req, res) => {
  const { songs } = req.body;

  if (!songs || !Array.isArray(songs) || songs.length === 0) {
    return res.status(400).json({ msg: 'Songs array is required' });
  }

  try {
    const setlist = await Setlist.findByPk(req.params.id);

    if (!setlist) {
      return res.status(404).json({ msg: 'Setlist not found' });
    }

    // Check if user has permission to update
    if (setlist.created_by !== req.user.id && !await isUserBandMember(req.user.id, setlist.band_id)) {
      return res.status(403).json({ msg: 'You do not have permission to update this setlist' });
    }

    // Update each song position in a transaction
    await sequelize.transaction(async (t) => {
      for (const song of songs) {
        await SetlistSong.update(
          { 
            position: song.position,
            block_id: song.block_id || null
          },
          { 
            where: { id: song.id },
            transaction: t
          }
        );
      }

      // Update the setlist's updated_at timestamp
      setlist.changed('updated_at', true);
      await setlist.save({ transaction: t });
    });

    // Get updated setlist songs
    const updatedSetlistSongs = await SetlistSong.findAll({
      where: { setlist_id: req.params.id },
      include: [
        {
          model: Song,
          as: 'song'
        },
        {
          model: Block,
          as: 'block'
        }
      ],
      order: [['position', 'ASC']]
    });

    // Emit socket event for real-time updates
    if (setlist.band_id) {
      io.to(`band:${setlist.band_id}`).emit('setlist:songs:reordered', {
        setlist_id: req.params.id,
        songs: updatedSetlistSongs
      });
    }
    io.to(`user:${req.user.id}`).emit('setlist:songs:reordered', {
      setlist_id: req.params.id,
      songs: updatedSetlistSongs
    });

    res.json(updatedSetlistSongs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Export setlist to PDF
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.exportSetlistToPDF = async (req, res) => {
  try {
    const setlist = await Setlist.findByPk(req.params.id, {
      include: [
        {
          model: Band,
          as: 'band'
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    if (!setlist) {
      return res.status(404).json({ msg: 'Setlist not found' });
    }

    // Check if user has access to this setlist
    const hasAccess = setlist.created_by === req.user.id || 
                      setlist.is_public || 
                      await isUserBandMember(req.user.id, setlist.band_id);

    if (!hasAccess) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    // Get setlist songs
    const setlistSongs = await SetlistSong.findAll({
      where: { setlist_id: req.params.id },
      include: [
        {
          model: Song,
          as: 'song'
        },
        {
          model: Block,
          as: 'block'
        }
      ],
      order: [['position', 'ASC']]
    });

    // Generate PDF
    const pdfBuffer = await PDFService.generateSetlistPDF(setlist, setlistSongs);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=setlist-${setlist.id}.pdf`);
    
    // Send the PDF as the response
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Export setlist to Spotify playlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.exportSetlistToSpotify = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { playlist_name, description, public } = req.body;

  try {
    const setlist = await Setlist.findByPk(req.params.id);

    if (!setlist) {
      return res.status(404).json({ msg: 'Setlist not found' });
    }

    // Check if user has access to this setlist
    const hasAccess = setlist.created_by === req.user.id || 
                      setlist.is_public || 
                      await isUserBandMember(req.user.id, setlist.band_id);

    if (!hasAccess) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    // Get setlist songs
    const setlistSongs = await SetlistSong.findAll({
      where: { setlist_id: req.params.id },
      include: [
        {
          model: Song,
          as: 'song'
        }
      ],
      order: [['position', 'ASC']]
    });

    // Get user's Spotify token
    const spotifyToken = await getUserSpotifyToken(req.user.id);
    
    if (!spotifyToken) {
      return res.status(401).json({ msg: 'Spotify account not connected. Please connect your Spotify account in settings.' });
    }

    // Create Spotify playlist
    const playlistResult = await SpotifyService.createPlaylistFromSetlist(
      spotifyToken,
      playlist_name,
      setlist.name,
      description || `Setlist: ${setlist.name}`,
      public || false,
      setlistSongs.map(s => s.song.spotify_id).filter(id => id) // Filter out songs without Spotify IDs
    );

    res.json({
      spotify_playlist_id: playlistResult.id,
      spotify_playlist_url: playlistResult.external_urls.spotify
    });
  } catch (err) {
    console.error(err.message);
    if (err.message.includes('Spotify API')) {
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).send('Server Error');
  }
};

/**
 * Generate a shareable link for a setlist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateShareLink = async (req, res) => {
  const { expiry = 30, read_only = true } = req.body;

  try {
    const setlist = await Setlist.findByPk(req.params.id);

    if (!setlist) {
      return res.status(404).json({ msg: 'Setlist not found' });
    }

    // Check if user has permission to share
    if (setlist.created_by !== req.user.id && !await isUserBandMember(req.user.id, setlist.band_id)) {
      return res.status(403).json({ msg: 'You do not have permission to share this setlist' });
    }

    // Generate share link
    const shareLink = await ShareService.generateShareLink(
      'setlist',
      req.params.id,
      expiry,
      read_only,
      req.user.id
    );

    res.json(shareLink);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Helper function to check if a user is a member of a band
 * @param {string} userId - User ID
 * @param {string} bandId - Band ID
 * @returns {Promise<boolean>} - True if user is a member, false otherwise
 */
async function isUserBandMember(userId, bandId) {
  if (!bandId) return false;
  
  const bandMember = await BandMember.findOne({
    where: {
      band_id: bandId,
      user_id: userId
    }
  });

  return !!bandMember;
}

/**
 * Helper function to get a user's Spotify token
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} - Spotify token or null
 */
async function getUserSpotifyToken(userId) {
  const userIntegration = await UserIntegration.findOne({
    where: {
      user_id: userId,
      provider: 'spotify'
    }
  });

  return userIntegration ? userIntegration.access_token : null;
}