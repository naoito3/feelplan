// Cloudflare KVを使用したシンプルなAPI

export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    const eventsData = await env.CALENDAR_KV.get('events');
    const events = eventsData ? JSON.parse(eventsData) : [];
    
    return new Response(JSON.stringify(events), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch events' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const newEvent = await request.json();
    
    // 既存のイベントを取得
    const eventsData = await env.CALENDAR_KV.get('events');
    const events = eventsData ? JSON.parse(eventsData) : [];
    
    // 新しいイベントを追加
    events.push(newEvent);
    
    // KVに保存
    await env.CALENDAR_KV.put('events', JSON.stringify(events));
    
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create event' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export async function onRequestPut(context) {
  const { request, env } = context;
  
  try {
    const updatedEvent = await request.json();
    
    // 既存のイベントを取得
    const eventsData = await env.CALENDAR_KV.get('events');
    const events = eventsData ? JSON.parse(eventsData) : [];
    
    // イベントを更新
    const index = events.findIndex(event => event.id === updatedEvent.id);
    if (index !== -1) {
      events[index] = updatedEvent;
    }
    
    // KVに保存
    await env.CALENDAR_KV.put('events', JSON.stringify(events));
    
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update event' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const eventId = parseInt(url.searchParams.get('id'));
  
  try {
    // 既存のイベントを取得
    const eventsData = await env.CALENDAR_KV.get('events');
    const events = eventsData ? JSON.parse(eventsData) : [];
    
    // イベントを削除
    const filteredEvents = events.filter(event => event.id !== eventId);
    
    // KVに保存
    await env.CALENDAR_KV.put('events', JSON.stringify(filteredEvents));
    
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete event' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}