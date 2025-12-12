import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-lynk-signature'
};
Deno.serve(async (req)=>{
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // Log request untuk debug
    console.log('Webhook received:', {
      method: req.method,
      headers: Object.fromEntries(req.headers.entries())
    });
    // Parse body
    let payload;
    try {
      const text = await req.text();
      console.log('Raw body:', text);
      payload = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error('Parse error:', e);
      payload = {};
    }
    console.log('Parsed payload:', payload);
    // Handle test/ping request
    if (!payload.data || !payload.data.message_data) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Webhook endpoint ready',
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const { event, data } = payload;
    const { message_action, message_data } = data;
    const { refId, customer, items, totals } = message_data;
    // Log webhook
    const { data: log, error: logError } = await supabase.from('payment_webhooks').insert({
      payment_id: refId,
      event_type: event,
      payload: payload,
      customer_email: customer?.email,
      processed: false
    }).select().single();
    if (logError) {
      console.error('Log error:', logError);
    }
    // Process payment
    if (event === 'payment.received' && message_action === 'SUCCESS') {
      const productTitle = items?.[0]?.title?.toLowerCase() || '';
      const tier = productTitle.includes('advance') ? 'advance' : 'premium';
      // Find user
      const { data: user } = await supabase.from('users').select('id').or(`email.eq.${customer?.email},payment_email.eq.${customer?.email}`).single();
      if (!user) {
        if (log) {
          await supabase.from('payment_webhooks').update({
            processed: true,
            error_message: 'User not found'
          }).eq('id', log.id);
        }
        throw new Error('User not found');
      }
      // Update subscription
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      await supabase.from('users').update({
        subscription_tier: tier,
        subscription_status: 'active',
        subscription_start_date: startDate.toISOString(),
        subscription_end_date: endDate.toISOString()
      }).eq('id', user.id);
      await supabase.from('subscriptions').insert({
        user_id: user.id,
        tier: tier,
        status: 'active',
        payment_method: 'lynk_id',
        payment_id: refId,
        payment_status: 'success',
        amount: totals?.grandTotal || 0,
        currency: 'IDR',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        customer_email: customer?.email,
        customer_name: customer?.name,
        customer_phone: customer?.phone
      });
      if (log) {
        await supabase.from('payment_webhooks').update({
          processed: true,
          processed_at: new Date().toISOString(),
          matched_user_id: user.id
        }).eq('id', log.id);
      }
      return new Response(JSON.stringify({
        success: true,
        user_id: user.id,
        tier
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      message: 'Webhook received'
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
