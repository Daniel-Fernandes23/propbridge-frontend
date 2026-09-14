// PropBridge — shared "List Your Property" modal.
// Injected once here and used by every page via <script src="/assets/modal.js"></script>.
// Editing the form? Change it here — every page picks it up automatically.

const BE = 'https://propbridge-backend-production.up.railway.app';

const MODAL_HTML = `
<div class="overlay" id="smodal">
  <div class="modal">
    <button class="xbtn" onclick="closeModal()">&times;</button>
    <div id="sform">
      <div class="modal-header">
        <h2>List Your Property</h2>
        <p class="sub">Complimentary listing · Cash buyers notified within 24 hours</p>
      </div>
      <div class="fee-note">PropBridge charges <strong>no upfront fee</strong>. Our <strong>2.5% platform fee</strong> is collected at closing only — significantly below traditional agent commissions.</div>
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
      <button class="modal-submit" id="sbtn" onclick="submitListing()">Submit Listing</button>
    </div>
    <div class="modal-success" id="ssucc">
      <div class="modal-success-line"></div>
      <h3>Listing Received</h3>
      <p>Your property is now live on PropBridge. Verified cash buyers in your area have been notified. Expect inquiries within 24–48 hours.</p>
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

async function submitListing() {
  const n = document.getElementById('sn').value.trim();
  const e = document.getElementById('se').value.trim();
  const a = document.getElementById('sa').value.trim();
  const p = document.getElementById('sq').value.replace(/[^0-9]/g, '');
  if (!n || !e || !a || !p) { alert('Please complete all required fields.'); return; }
  const btn = document.getElementById('sbtn');
  btn.textContent = 'Submitting...';
  btn.disabled = true;
  const pts = a.split(',');
  try {
    await fetch(BE + '/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seller_name: n,
        seller_email: e,
        seller_phone: document.getElementById('sp').value,
        address: pts[0]?.trim() || a,
        city: pts[1]?.trim() || '',
        state: pts[2]?.trim().split(' ')[0] || '',
        zip: pts[2]?.trim().split(' ')[1] || '',
        price: p,
        property_type: document.getElementById('st').value,
        bedrooms: document.getElementById('sb').value,
        bathrooms: document.getElementById('sba').value,
        timeline: document.getElementById('stl').value,
        notes: document.getElementById('sno').value
      })
    });
  } catch (err) {}
  document.getElementById('sform').style.display = 'none';
  document.getElementById('ssucc').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', injectModal);
