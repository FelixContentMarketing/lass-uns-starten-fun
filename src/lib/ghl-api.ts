import { supabase } from './supabase';

const GHL_API_BASE_URL = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

/**
 * Get GHL API credentials from app settings
 */
async function getGhlCredentials() {
  const { data: tokenSetting } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'ghl_api_token')
    .single();

  const { data: locationSetting } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'ghl_location_id')
    .single();

  if (!tokenSetting?.value || !locationSetting?.value) {
    throw new Error('GoHighLevel API credentials not configured');
  }

  return {
    token: tokenSetting.value,
    locationId: locationSetting.value,
  };
}

/**
 * Create a task in GoHighLevel
 */
export async function createGhlTask(task: {
  title: string;
  body?: string;
  dueDate?: string;
  assignedTo?: string;
  contactId?: string;
}) {
  const { token } = await getGhlCredentials();

  const response = await fetch(`${GHL_API_BASE_URL}/tasks/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Version': GHL_API_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: task.title,
      body: task.body,
      dueDate: task.dueDate,
      assignedTo: task.assignedTo,
      contactId: task.contactId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GHL API Error: ${error}`);
  }

  return response.json();
}

/**
 * Update a task in GoHighLevel
 */
export async function updateGhlTask(taskId: string, updates: {
  title?: string;
  body?: string;
  dueDate?: string;
  assignedTo?: string;
  completed?: boolean;
}) {
  const { token } = await getGhlCredentials();

  const response = await fetch(`${GHL_API_BASE_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Version': GHL_API_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GHL API Error: ${error}`);
  }

  return response.json();
}

/**
 * Delete a task in GoHighLevel
 */
export async function deleteGhlTask(taskId: string) {
  const { token } = await getGhlCredentials();

  const response = await fetch(`${GHL_API_BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Version': GHL_API_VERSION,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GHL API Error: ${error}`);
  }

  return response.json();
}

/**
 * Get users from GoHighLevel
 * Note: GHL API doesn't have a direct "list all users" endpoint.
 * This function uses the locations endpoint to get users.
 */
export async function getGhlUsers() {
  const { token, locationId } = await getGhlCredentials();

  // Try the locations endpoint which includes users
  const response = await fetch(`${GHL_API_BASE_URL}/locations/${locationId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Version': GHL_API_VERSION,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GHL API Error: ${JSON.parse(error).message || error}`);
  }

  const data = await response.json();
  
  // Extract users from location data if available
  // If not available, return empty array
  return {
    users: data.users || [],
    location: data
  };
}

/**
 * Sync GHL users to local database
 */
export async function syncGhlUsers() {
  const users = await getGhlUsers();

  for (const user of users.users || []) {
    await supabase
      .from('ghl_users')
      .upsert({
        ghl_user_id: user.id,
        name: user.name,
        email: user.email,
        last_synced_at: new Date().toISOString(),
      }, {
        onConflict: 'ghl_user_id',
      });
  }

  return users;
}

