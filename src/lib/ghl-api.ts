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
 * Note: Tasks MUST be associated with a contact in GHL
 */
export async function createGhlTask(task: {
  title: string;
  contactId: string; // Required in GHL
  body?: string;
  dueDate?: string;
  assignedTo?: string;
}) {
  const { token } = await getGhlCredentials();

  if (!task.contactId) {
    throw new Error('contactId ist erforderlich zum Erstellen einer GHL-Aufgabe');
  }

  // Only include assignedTo if it has a valid value
  const requestBody: any = {
    title: task.title,
    body: task.body,
    dueDate: task.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default: 7 days from now
    completed: false,
  };

  // Only add assignedTo if it's provided and not empty
  if (task.assignedTo && task.assignedTo !== 'unassigned') {
    requestBody.assignedTo = task.assignedTo;
  }

  const response = await fetch(`${GHL_API_BASE_URL}/contacts/${task.contactId}/tasks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Version': GHL_API_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GHL API Error: ${error}`);
  }

  const result = await response.json();
  // GHL returns task ID in _id field
  return { task: { id: result._id || result.id, ...result } };
}

/**
 * Update a task in GoHighLevel
 */
export async function updateGhlTask(taskId: string, contactId: string, updates: {
  title?: string;
  body?: string;
  dueDate?: string;
  assignedTo?: string;
  completed?: boolean;
}) {
  const { token } = await getGhlCredentials();

  const response = await fetch(`${GHL_API_BASE_URL}/contacts/${contactId}/tasks/${taskId}`, {
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
export async function deleteGhlTask(taskId: string, contactId: string) {
  const { token } = await getGhlCredentials();

  const response = await fetch(`${GHL_API_BASE_URL}/contacts/${contactId}/tasks/${taskId}`, {
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
 * Get tasks from GoHighLevel using location-level search
 */
export async function getGhlTasks() {
  const { token, locationId } = await getGhlCredentials();

  const response = await fetch(`${GHL_API_BASE_URL}/locations/${locationId}/tasks/search`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Version': GHL_API_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}), // Empty body for fetching all tasks
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = errorText;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorText;
    } catch (e) {
      // If not JSON, use the text as is
    }
    throw new Error(`GHL API Error: ${errorMessage}`);
  }

  const data = await response.json();
  return data.tasks || [];
}

/**
 * Sync GHL tasks to local database
 */
export async function syncGhlTasks() {
  // First, sync users to ensure all assigned_to references are valid
  try {
    await syncGhlUsers();
  } catch (error) {
    console.error('Fehler beim Synchronisieren der GHL Users:', error);
    // Continue with task sync even if user sync fails
  }

  const tasks = await getGhlTasks();

  if (!tasks || tasks.length === 0) {
    return { synced: 0, message: 'Keine Aufgaben in GoHighLevel gefunden' };
  }

  let syncedCount = 0;
  let errorCount = 0;

  // Get current user for created_by field
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Nicht angemeldet');
  }

  for (const task of tasks) {
    // Map GHL task status to our Kanban status (use English values for DB)
    let status = 'inbox';
    if (task.completed) {
      status = 'done';
    } else if (task.status === 'in_progress') {
      status = 'in_progress';
    }

    // Check if task already exists
    const { data: existingTask } = await supabase
      .from('tasks')
      .select('id')
      .eq('ghl_task_id', task.id)
      .single();

    const taskData = {
      ghl_task_id: task.id,
      title: task.title || 'Unbenannte Aufgabe',
      description: task.body || null,
      status: status,
      priority: 'medium',
      due_date: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      ghl_contact_id: task.contactId || null,
      assigned_to: task.assignedTo || null,
      created_by: user.id,
    };

    let error;
    if (existingTask) {
      // Update existing task
      const { error: updateError } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', existingTask.id);
      error = updateError;
    } else {
      // Insert new task
      const { error: insertError } = await supabase
        .from('tasks')
        .insert(taskData);
      error = insertError;
    }

    if (error) {
      console.error('Fehler beim Synchronisieren von Task:', task.id, error);
      errorCount++;
    } else {
      syncedCount++;
    }
  }

  return { 
    synced: syncedCount, 
    total: tasks.length,
    errors: errorCount 
  };
}

/**
 * Get users from GoHighLevel
 */
export async function getGhlUsers() {
  const { token, locationId } = await getGhlCredentials();

  const response = await fetch(`${GHL_API_BASE_URL}/locations/${locationId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Version': GHL_API_VERSION,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = errorText;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorText;
    } catch (e) {
      // If not JSON, use the text as is
    }
    throw new Error(`GHL API Error: ${errorMessage}`);
  }

  const data = await response.json();
  
  return {
    users: data.users || [],
  };
}

/**
 * Sync GHL users to local database
 */
export async function syncGhlUsers() {
  const result = await getGhlUsers();
  const users = result.users;

  if (!users || users.length === 0) {
    throw new Error('No users found in GoHighLevel location');
  }

  for (const user of users) {
    await supabase
      .from('ghl_users')
      .upsert({
        ghl_user_id: user.id,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email,
        last_synced_at: new Date().toISOString(),
      }, {
        onConflict: 'ghl_user_id',
      });
  }

  return result;
}

/**
 * Get contacts from GoHighLevel
 */
export async function getGhlContacts() {
  const { token, locationId } = await getGhlCredentials();

  const response = await fetch(`${GHL_API_BASE_URL}/contacts/?locationId=${locationId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Version': GHL_API_VERSION,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = errorText;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorText;
    } catch (e) {
      // If not JSON, use the text as is
    }
    throw new Error(`GHL API Error: ${errorMessage}`);
  }

  const data = await response.json();
  return data.contacts || [];
}

