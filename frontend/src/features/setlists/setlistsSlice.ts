import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../store';

// Types
export interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  tempo: number;
  duration: number;
  notes: string;
  spotify_id?: string;
  youtube_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SetlistSong {
  id: string;
  setlist_id: string;
  song_id: string;
  position: number;
  block_id?: string;
  notes?: string;
  song: Song;
  created_at: string;
  updated_at: string;
}

export interface Block {
  id: string;
  setlist_id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Setlist {
  id: string;
  name: string;
  description?: string;
  band_id?: string;
  created_by: string;
  is_public: boolean;
  blocks?: Block[];
  created_at: string;
  updated_at: string;
}

// State type
interface SetlistsState {
  setlists: Setlist[];
  currentSetlist: Setlist | null;
  setlistSongs: SetlistSong[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: SetlistsState = {
  setlists: [],
  currentSetlist: null,
  setlistSongs: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchSetlists = createAsyncThunk<Setlist[], void, { state: RootState }>(
  'setlists/fetchSetlists',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/setlists');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to fetch setlists');
    }
  }
);

export const fetchSetlistById = createAsyncThunk<Setlist, string, { state: RootState }>(
  'setlists/fetchSetlistById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/setlists/${id}`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to fetch setlist');
    }
  }
);

export const fetchSetlistSongs = createAsyncThunk<SetlistSong[], string, { state: RootState }>(
  'setlists/fetchSetlistSongs',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/setlists/${id}/songs`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to fetch setlist songs');
    }
  }
);

export const createSetlist = createAsyncThunk<
  Setlist,
  { name: string; description?: string; band_id?: string; is_public?: boolean },
  { state: RootState }
>(
  'setlists/createSetlist',
  async (setlistData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/setlists', setlistData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to create setlist');
    }
  }
);

export const updateSetlist = createAsyncThunk<
  Setlist,
  { id: string; name?: string; description?: string; is_public?: boolean },
  { state: RootState }
>(
  'setlists/updateSetlist',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/setlists/${id}`, data);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to update setlist');
    }
  }
);

export const deleteSetlist = createAsyncThunk<string, string, { state: RootState }>(
  'setlists/deleteSetlist',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/setlists/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to delete setlist');
    }
  }
);

export const addSongToSetlist = createAsyncThunk<
  SetlistSong,
  { setlist_id: string; song_id: string; position: number; block_id?: string; notes?: string },
  { state: RootState }
>(
  'setlists/addSongToSetlist',
  async ({ setlist_id, ...data }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/setlists/${setlist_id}/songs`, data);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to add song to setlist');
    }
  }
);

export const removeSongFromSetlist = createAsyncThunk<
  { setlist_id: string; song_id: string },
  { setlist_id: string; song_id: string },
  { state: RootState }
>(
  'setlists/removeSongFromSetlist',
  async ({ setlist_id, song_id }, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/setlists/${setlist_id}/songs/${song_id}`);
      return { setlist_id, song_id };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to remove song from setlist');
    }
  }
);

export const reorderSetlistSongs = createAsyncThunk<
  SetlistSong[],
  { setlist_id: string; songs: { id: string; position: number; block_id?: string }[] },
  { state: RootState }
>(
  'setlists/reorderSetlistSongs',
  async ({ setlist_id, songs }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/setlists/${setlist_id}/reorder`, { songs });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to reorder setlist songs');
    }
  }
);

// Slice
const setlistsSlice = createSlice({
  name: 'setlists',
  initialState,
  reducers: {
    clearCurrentSetlist(state) {
      state.currentSetlist = null;
      state.setlistSongs = [];
    },
    resetSetlistsState(state) {
      state.setlists = [];
      state.currentSetlist = null;
      state.setlistSongs = [];
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch setlists
      .addCase(fetchSetlists.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSetlists.fulfilled, (state, action: PayloadAction<Setlist[]>) => {
        state.isLoading = false;
        state.setlists = action.payload;
      })
      .addCase(fetchSetlists.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch setlist by ID
      .addCase(fetchSetlistById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSetlistById.fulfilled, (state, action: PayloadAction<Setlist>) => {
        state.isLoading = false;
        state.currentSetlist = action.payload;
      })
      .addCase(fetchSetlistById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch setlist songs
      .addCase(fetchSetlistSongs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSetlistSongs.fulfilled, (state, action: PayloadAction<SetlistSong[]>) => {
        state.isLoading = false;
        state.setlistSongs = action.payload;
      })
      .addCase(fetchSetlistSongs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create setlist
      .addCase(createSetlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSetlist.fulfilled, (state, action: PayloadAction<Setlist>) => {
        state.isLoading = false;
        state.setlists.push(action.payload);
      })
      .addCase(createSetlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update setlist
      .addCase(updateSetlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSetlist.fulfilled, (state, action: PayloadAction<Setlist>) => {
        state.isLoading = false;
        const index = state.setlists.findIndex((setlist) => setlist.id === action.payload.id);
        if (index !== -1) {
          state.setlists[index] = action.payload;
        }
        if (state.currentSetlist?.id === action.payload.id) {
          state.currentSetlist = action.payload;
        }
      })
      .addCase(updateSetlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete setlist
      .addCase(deleteSetlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSetlist.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.setlists = state.setlists.filter((setlist) => setlist.id !== action.payload);
        if (state.currentSetlist?.id === action.payload) {
          state.currentSetlist = null;
          state.setlistSongs = [];
        }
      })
      .addCase(deleteSetlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Add song to setlist
      .addCase(addSongToSetlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addSongToSetlist.fulfilled, (state, action: PayloadAction<SetlistSong>) => {
        state.isLoading = false;
        state.setlistSongs.push(action.payload);
        // Sort by position
        state.setlistSongs.sort((a, b) => a.position - b.position);
      })
      .addCase(addSongToSetlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Remove song from setlist
      .addCase(removeSongFromSetlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeSongFromSetlist.fulfilled, (state, action: PayloadAction<{ setlist_id: string; song_id: string }>) => {
        state.isLoading = false;
        state.setlistSongs = state.setlistSongs.filter(
          (setlistSong) => setlistSong.song_id !== action.payload.song_id
        );
      })
      .addCase(removeSongFromSetlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Reorder setlist songs
      .addCase(reorderSetlistSongs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reorderSetlistSongs.fulfilled, (state, action: PayloadAction<SetlistSong[]>) => {
        state.isLoading = false;
        state.setlistSongs = action.payload;
      })
      .addCase(reorderSetlistSongs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentSetlist, resetSetlistsState } = setlistsSlice.actions;
export default setlistsSlice.reducer;