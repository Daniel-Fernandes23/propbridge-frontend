// PropBridge — shared "List Your Property" modal.
// Injected once here and used by every page via <script src="/assets/modal.js"></script>.
// Editing the form? Change it here — every page picks it up automatically.

const PB_API = 'https://propbridge-backend-production.up.railway.app';

// Founding listings are free. When the $249 fee returns, restore the Stripe payment step:
// https://buy.stripe.com/3cIcN5eIl3QK0uJ7sq6J200

const MODAL_HTML = `
<div class="overlay" id="smodal">
  <div class="modal">
    <button class="xbtn" onclick="closeModal()">&times;</button>
    <div id="sform">
      <div class="modal-header">
        <h2>List Your Property</h2>
        <p class="sub">Free founding listing · Regular fee $249</p>
      </div>
      <div class="fee-note"><strong>Founding listings are free</strong> for our first 30 sellers (regular fee: flat $249). There is <strong>no percentage of your sale price</strong> and nothing due at closing. Buyers contact you directly and you negotiate yourself.</div>
      <div class="fgroup"><label>Full Name</label><input type="text" id="sn" placeholder="Your name"></div>
      <div class="fgroup"><label>Email Address</label><input type="email" id="se" placeholder="your@email.com"></div>
      <div class="fgroup"><label>Phone Number</label><input type="tel" id="sp" placeholder="(555) 000-0000"></div>
      <div class="fgroup"><label>Property Address</label><input type="text" id="sa" placeholder="123 Main St, Houston, TX 77001"></div>
      <div class="fgrow">
        <div class="fgroup"><label>Asking Price</label><input type="text" id="sq" placeholder="$250,000"></div>
        <div class="fgroup"><label>Property Type</label>
          <select id="st"><option value="single_family">Single Family Home</option><option value="apartment_complex">Apartment Complex</option><option value="duplex">Duplex / Triplex</option><option value="multi_family">Multi-Family</option><option value="condo">Condo / Townhouse</option><option value="land">Land / Lot</option><option value="commercial">Commercial</option></select>
        </div>
      </div>
      <div class="fgrow">
        <div class="fgroup"><label>Bedrooms</label><input type="number" id="sb" placeholder="3" min="0"></div>
        <div class="fgroup"><label>Bathrooms</label><input type="number" id="sba" placeholder="2" min="0" step="0.5"></div>
      </div>
      <div class="fgroup"><label>Selling Timeline</label>
        <select id="stl"><option value="asap">As Soon As Possible</option><option value="1_3_months">1–3 Months</option><option value="3_6_months">3–6 Months</option><option value="flexible">Flexible</option></select>
      </div>
      <div class="fgroup"><label>Additional Notes</label><textarea id="sno" rows="2" placeholder="Property condition, reason for selling, any relevant details..."></textarea></div>
      <button class="modal-submit" id="sbtn" onclick="submitListing()">Submit free listing</button>
    </div>
    <div class="modal-success" id="ssucc">
      <div class="modal-success-line"></div>
      <h3>Details received</h3>
      <p>Thanks! We'll confirm your address, price and photos with you, usually within 24 hours, then publish your listing so cash buyers in your area can contact you directly.</p>
      <p class="pay-note">Your founding listing is free. Questions? daniel@propbridgehomes.com</p>
    </div>
  </div>
</div>
`;

function injectModal() {
  document.body.insertAdjacentHTML('beforeend', MODAL_HTML);
  document.getElementById('smodal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('smodal')) closeModal();
  });
}

function openModal() {
  document.getElementById('smodal').classList.add('open');
}

function closeModal() {
  document.getElementById('smodal').classList.remove('open');
}

// Sends a form submission to daniel@propbridgehomes.com via Formspree. Returns true on success.
async function pbSend(subject, data){
  const fd=new FormData();
  fd.append('_subject', subject);
  if(data.email) fd.append('_replyto', data.email);
  Object.entries(data).forEach(([k,v])=>fd.append(k, v==null?'':String(v)));
  try{
    const r=await fetch('https://formspree.io/f/mppznekg',{method:'POST',body:fd,headers:{'Accept':'application/json'}});
    return r.ok;
  }catch(e){return false}
}
const PB_EMAIL_OK=/^[^@\s]+@[^@\s]+\.[^@\s]+$/;

async function submitListing() {
  const v = id => (document.getElementById(id)?.value || '').trim();
  const n = v('sn'), e = v('se'), a = v('sa');
  const p = v('sq').replace(/[^0-9]/g, '');
  if (!n || !e || !a || !p) { alert('Please complete all required fields.'); return; }
  if (!PB_EMAIL_OK.test(e)) { alert('Please enter a valid email address.'); return; }
  const btn = document.getElementById('sbtn'); const old = btn.textContent;
  btn.textContent = 'Submitting...'; btn.disabled = true;
  const data = { form: 'List Your Property', name: n, email: e, phone: v('sp'), address: a, asking_price: p,
    property_type: v('st'), bedrooms: v('sb'), bathrooms: v('sba'), timeline: v('stl'), notes: v('sno') };
  const ok = await pbSend('New PropBridge listing submission: ' + a, data);
  if (!ok) { btn.textContent = old; btn.disabled = false; alert("Sorry, your listing didn't go through. Please try again or email daniel@propbridgehomes.com."); return; }
  // Best-effort copy to the backend; never blocks the seller
  try {
    const pts = a.split(',');
    fetch(PB_API + '/api/listings', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seller_name: n, seller_email: e, seller_phone: data.phone, address: pts[0]?.trim() || a,
        city: pts[1]?.trim() || '', state: pts[2]?.trim().split(' ')[0] || '', zip: pts[2]?.trim().split(' ')[1] || '',
        price: p, property_type: data.property_type, bedrooms: data.bedrooms, bathrooms: data.bathrooms,
        timeline: data.timeline, notes: data.notes }) }).catch(() => {});
  } catch (err) {}
  document.getElementById('sform').style.display = 'none';
  document.getElementById('ssucc').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', injectModal);
