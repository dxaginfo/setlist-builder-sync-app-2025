import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  MusicNote as MusicNoteIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { deleteSetlist, Setlist } from './setlistsSlice';
import { formatDistanceToNow } from 'date-fns';

interface SetlistListProps {
  setlists: Setlist[];
  onEdit?: (setlist: Setlist) => void;
  onCopy?: (setlist: Setlist) => void;
  onShare?: (setlist: Setlist) => void;
}

const SetlistList: React.FC<SetlistListProps> = ({ 
  setlists, 
  onEdit,
  onCopy,
  onShare
}) => {
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSetlist, setSelectedSetlist] = useState<Setlist | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, setlist: Setlist) => {
    setAnchorEl(event.currentTarget);
    setSelectedSetlist(setlist);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleEditClick = () => {
    if (selectedSetlist && onEdit) {
      onEdit(selectedSetlist);
    }
    handleMenuClose();
  };
  
  const handleCopyClick = () => {
    if (selectedSetlist && onCopy) {
      onCopy(selectedSetlist);
    }
    handleMenuClose();
  };
  
  const handleShareClick = () => {
    if (selectedSetlist && onShare) {
      onShare(selectedSetlist);
    }
    handleMenuClose();
  };
  
  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (selectedSetlist) {
      dispatch(deleteSetlist(selectedSetlist.id));
    }
    setDeleteDialogOpen(false);
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };
  
  if (setlists.length === 0) {
    return (
      <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
        No setlists found. Create your first setlist!
      </Typography>
    );
  }
  
  return (
    <>
      <Grid container spacing={3}>
        {setlists.map((setlist) => (
          <Grid item xs={12} sm={6} md={4} key={setlist.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="div" sx={{ mb: 1 }}>
                  {setlist.name}
                </Typography>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  {setlist.is_public ? (
                    <Tooltip title="Public setlist">
                      <Chip 
                        icon={<PublicIcon />} 
                        label="Public" 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Private setlist">
                      <Chip 
                        icon={<LockIcon />} 
                        label="Private" 
                        size="small" 
                        color="default" 
                        variant="outlined" 
                      />
                    </Tooltip>
                  )}
                  
                  {setlist.band_id && (
                    <Tooltip title="Band setlist">
                      <Chip 
                        icon={<PeopleIcon />} 
                        label="Band" 
                        size="small" 
                        color="secondary" 
                        variant="outlined" 
                      />
                    </Tooltip>
                  )}
                </div>
                
                {setlist.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {setlist.description.length > 120 
                      ? `${setlist.description.substring(0, 120)}...` 
                      : setlist.description}
                  </Typography>
                )}
                
                <Typography variant="body2" color="text.secondary">
                  Created {formatDistanceToNow(new Date(setlist.created_at))} ago
                </Typography>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Button 
                  component={RouterLink} 
                  to={`/setlists/${setlist.id}`}
                  variant="contained" 
                  color="primary"
                  startIcon={<MusicNoteIcon />}
                >
                  View
                </Button>
                
                <IconButton 
                  aria-label="more" 
                  onClick={(e) => handleMenuOpen(e, setlist)}
                >
                  <MoreVertIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleCopyClick}>
          <CopyIcon fontSize="small" sx={{ mr: 1 }} />
          Duplicate
        </MenuItem>
        <MenuItem onClick={handleShareClick}>
          <ShareIcon fontSize="small" sx={{ mr: 1 }} />
          Share
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
      
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Setlist</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the setlist "{selectedSetlist?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SetlistList;