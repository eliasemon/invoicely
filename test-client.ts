import { getClientSummary } from './src/app/actions/clientActions';
import { getUserId } from './src/lib/supabase/admin';

// Mock getUserId
jest.mock('./src/lib/supabase/admin', () => ({
  ...jest.requireActual('./src/lib/supabase/admin'),
  getUserId: jest.fn().mockResolvedValue('google-oauth2|117822624506123974507')
}));

// This is getting complicated... let's just make a plain fetch using supabaseAdmin
