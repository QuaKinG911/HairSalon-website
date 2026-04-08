(function () {
  var dataEl = document.getElementById('hair-data');
  if (!dataEl) return;
  var hairstyles = JSON.parse(dataEl.textContent || '[]');

  var photo = document.getElementById('photo');
  var preview = document.getElementById('preview');
  var previewWrap = document.getElementById('preview-wrap');
  var btnPrefs = document.getElementById('btnPrefs');
  var stepUpload = document.getElementById('step-upload');
  var stepPrefs = document.getElementById('step-prefs');
  var stepAnalyzing = document.getElementById('step-analyzing');
  var stepResults = document.getElementById('step-results');
  var btnAnalyze = document.getElementById('btnAnalyze');
  var analysisText = document.getElementById('analysis-text');
  var recGrid = document.getElementById('rec-grid');

  photo.addEventListener('change', function () {
    var f = photo.files && photo.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      preview.src = r.result;
      previewWrap.classList.remove('hidden');
      btnPrefs.disabled = false;
    };
    r.readAsDataURL(f);
  });

  btnPrefs.addEventListener('click', function () {
    stepUpload.classList.add('hidden');
    stepPrefs.classList.remove('hidden');
  });

  btnAnalyze.addEventListener('click', function () {
    stepPrefs.classList.add('hidden');
    stepAnalyzing.classList.remove('hidden');
    setTimeout(function () {
      var shapes = ['oval', 'round', 'square', 'heart', 'diamond'];
      var types = ['straight', 'wavy', 'curly'];
      var face = shapes[Math.floor(Math.random() * shapes.length)];
      var hair = types[Math.floor(Math.random() * types.length)];
      analysisText.textContent =
        'Detected face shape: ' + face + '. Hair type estimate: ' + hair + '. (Demo — not medical or professional advice.)';

      var picks = hairstyles.slice(0, Math.min(6, hairstyles.length));
      recGrid.innerHTML = '';
      picks.forEach(function (h) {
        var card = document.createElement('div');
        card.className = 'rec-card';
        card.innerHTML =
          '<img src="' +
          (h.image || '') +
          '" alt="" /><div class="body"><h4>' +
          (h.name || '') +
          '</h4><p>' +
          (h.description || '').slice(0, 120) +
          '…</p></div>';
        recGrid.appendChild(card);
      });

      stepAnalyzing.classList.add('hidden');
      stepResults.classList.remove('hidden');
    }, 900);
  });
})();
