import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      'x-api-secret': process.env.SUPABASE_RPC_SECRET!
    }
  }
});

async function main() {
  const { data, error } = await supabaseAdmin.from('clients').select('*');
  console.log('Clients:', data);
  if (error) console.error('Error:', error);
}

main();
