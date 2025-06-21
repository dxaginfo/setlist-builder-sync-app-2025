const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const setlistController = require('../controllers/setlist.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Setlist:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated UUID of the setlist
 *         name:
 *           type: string
 *           description: The name of the setlist
 *         description:
 *           type: string
 *           description: Optional description of the setlist
 *         band_id:
 *           type: string
 *           format: uuid
 *           description: The UUID of the band this setlist belongs to
 *         created_by:
 *           type: string
 *           format: uuid
 *           description: User ID of the creator
 *         is_public:
 *           type: boolean
 *           description: Whether the setlist is publicly viewable
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date and time the setlist was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date and time the setlist was last updated
 */

/**
 * @swagger
 * /api/setlists:
 *   get:
 *     summary: Get all setlists for the authenticated user
 *     tags: [Setlists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of setlists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Setlist'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', auth, setlistController.getAllSetlists);

/**
 * @swagger
 * /api/setlists/{id}:
 *   get:
 *     summary: Get a setlist by ID
 *     tags: [Setlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID of the setlist
 *     responses:
 *       200:
 *         description: Setlist found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Setlist'
 *       404:
 *         description: Setlist not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id', auth, setlistController.getSetlistById);

/**
 * @swagger
 * /api/setlists:
 *   post:
 *     summary: Create a new setlist
 *     tags: [Setlists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               band_id:
 *                 type: string
 *                 format: uuid
 *               is_public:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Setlist created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Setlist'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', [
  auth,
  check('name', 'Name is required').notEmpty(),
], setlistController.createSetlist);

/**
 * @swagger
 * /api/setlists/{id}:
 *   put:
 *     summary: Update a setlist
 *     tags: [Setlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID of the setlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               is_public:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Setlist updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Setlist'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Setlist not found
 *       500:
 *         description: Server error
 */
router.put('/:id', auth, setlistController.updateSetlist);

/**
 * @swagger
 * /api/setlists/{id}:
 *   delete:
 *     summary: Delete a setlist
 *     tags: [Setlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID of the setlist
 *     responses:
 *       200:
 *         description: Setlist deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Setlist not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, setlistController.deleteSetlist);

/**
 * @swagger
 * /api/setlists/{id}/songs:
 *   get:
 *     summary: Get all songs in a setlist
 *     tags: [Setlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID of the setlist
 *     responses:
 *       200:
 *         description: List of songs in the setlist
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Setlist not found
 *       500:
 *         description: Server error
 */
router.get('/:id/songs', auth, setlistController.getSetlistSongs);

/**
 * @swagger
 * /api/setlists/{id}/songs:
 *   post:
 *     summary: Add a song to a setlist
 *     tags: [Setlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID of the setlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - song_id
 *               - position
 *             properties:
 *               song_id:
 *                 type: string
 *                 format: uuid
 *               position:
 *                 type: integer
 *               block_id:
 *                 type: string
 *                 format: uuid
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Song added to setlist successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Setlist or song not found
 *       500:
 *         description: Server error
 */
router.post('/:id/songs', [
  auth,
  check('song_id', 'Song ID is required').isUUID(),
  check('position', 'Position is required and must be a number').isInt(),
], setlistController.addSongToSetlist);

/**
 * @swagger
 * /api/setlists/{id}/songs/{songId}:
 *   delete:
 *     summary: Remove a song from a setlist
 *     tags: [Setlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID of the setlist
 *       - in: path
 *         name: songId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID of the song to remove
 *     responses:
 *       200:
 *         description: Song removed from setlist successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Setlist or song not found
 *       500:
 *         description: Server error
 */
router.delete('/:id/songs/:songId', auth, setlistController.removeSongFromSetlist);

/**
 * @swagger
 * /api/setlists/{id}/reorder:
 *   put:
 *     summary: Reorder songs in a setlist
 *     tags: [Setlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID of the setlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - songs
 *             properties:
 *               songs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - position
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     position:
 *                       type: integer
 *                     block_id:
 *                       type: string
 *                       format: uuid
 *     responses:
 *       200:
 *         description: Songs reordered successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Setlist not found
 *       500:
 *         description: Server error
 */
router.put('/:id/reorder', auth, setlistController.reorderSetlistSongs);

/**
 * @swagger
 * /api/setlists/{id}/export:
 *   get:
 *     summary: Export setlist to PDF
 *     tags: [Setlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID of the setlist
 *     responses:
 *       200:
 *         description: PDF document
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Setlist not found
 *       500:
 *         description: Server error
 */
router.get('/:id/export', auth, setlistController.exportSetlistToPDF);

/**
 * @swagger
 * /api/setlists/{id}/spotify:
 *   post:
 *     summary: Export setlist to Spotify playlist
 *     tags: [Setlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID of the setlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playlist_name
 *             properties:
 *               playlist_name:
 *                 type: string
 *               description:
 *                 type: string
 *               public:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Successfully exported to Spotify
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 spotify_playlist_id:
 *                   type: string
 *                 spotify_playlist_url:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Setlist not found
 *       500:
 *         description: Server error
 */
router.post('/:id/spotify', [
  auth,
  check('playlist_name', 'Playlist name is required').notEmpty(),
], setlistController.exportSetlistToSpotify);

/**
 * @swagger
 * /api/setlists/{id}/share:
 *   post:
 *     summary: Generate a shareable link for a setlist
 *     tags: [Setlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: UUID of the setlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expiry:
 *                 type: integer
 *                 description: Expiry time in days (default 30)
 *               read_only:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Shareable link generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 share_url:
 *                   type: string
 *                   format: uri
 *                 expires_at:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Setlist not found
 *       500:
 *         description: Server error
 */
router.post('/:id/share', auth, setlistController.generateShareLink);

module.exports = router;