console.log('Zone Finder: JS file loaded');


/* ============================================
   USDA HARDINESS ZONE FINDER
============================================ */

function initZoneFinder() {

    console.log('Zone Finder: initializing...');

    const zoneFinder = document.querySelector('[data-zone-finder]');

    if (!zoneFinder) {
        console.warn('Zone Finder: [data-zone-finder] element not found.');
        return;
    }

    // Prevent initializing the same finder more than once
    if (zoneFinder.dataset.initialized === 'true') {
        console.log('Zone Finder: already initialized.');
        return;
    }

    zoneFinder.dataset.initialized = 'true';


    /* ============================================
       ELEMENTS
    ============================================ */

    const trigger = zoneFinder.querySelector('.zone-finder__trigger');
    const triggerText = zoneFinder.querySelector('.zone-finder__trigger-text');
    const modal = zoneFinder.querySelector('.zone-finder__modal');
    const closeButton = zoneFinder.querySelector('.zone-finder__close');
    const form = zoneFinder.querySelector('.zone-finder__form');
    const input = zoneFinder.querySelector('.zone-finder__input');
    const result = zoneFinder.querySelector('.zone-finder__result');

    const dataUrl = zoneFinder.dataset.zoneDataUrl;


    /* ============================================
       DEBUG
    ============================================ */

    console.log('Zone Finder: container found:', zoneFinder);
    console.log('Zone Finder: trigger:', trigger);
    console.log('Zone Finder: modal:', modal);
    console.log('Zone Finder: form:', form);
    console.log('Zone Finder: input:', input);
    console.log('Zone Finder: result:', result);
    console.log('Zone Finder: USDA data URL:', dataUrl);


    /* ============================================
       VALIDATE REQUIRED ELEMENTS
    ============================================ */

    if (!trigger) {
        console.error('Zone Finder: trigger button not found.');
        return;
    }

    if (!modal) {
        console.error('Zone Finder: modal not found.');
        return;
    }

    if (!form) {
        console.error('Zone Finder: form not found.');
        return;
    }

    if (!input) {
        console.error('Zone Finder: ZIP input not found.');
        return;
    }

    if (!result) {
        console.error('Zone Finder: result container not found.');
        return;
    }

    if (!dataUrl) {
        console.error(
            'Zone Finder: USDA JSON URL is missing. Check data-zone-data-url.'
        );
        return;
    }


    /* ============================================
       ZONE TEMPERATURE RANGES
    ============================================ */

    const zoneTemperatures = {
        '1a': '-60°F to -55°F',
        '1b': '-55°F to -50°F',

        '2a': '-50°F to -45°F',
        '2b': '-45°F to -40°F',

        '3a': '-40°F to -35°F',
        '3b': '-35°F to -30°F',

        '4a': '-30°F to -25°F',
        '4b': '-25°F to -20°F',

        '5a': '-20°F to -15°F',
        '5b': '-15°F to -10°F',

        '6a': '-10°F to -5°F',
        '6b': '-5°F to 0°F',

        '7a': '0°F to 5°F',
        '7b': '5°F to 10°F',

        '8a': '10°F to 15°F',
        '8b': '15°F to 20°F',

        '9a': '20°F to 25°F',
        '9b': '25°F to 30°F',

        '10a': '30°F to 35°F',
        '10b': '35°F to 40°F',

        '11a': '40°F to 45°F',
        '11b': '45°F to 50°F',

        '12a': '50°F to 55°F',
        '12b': '55°F to 60°F',

        '13a': '60°F to 65°F',
        '13b': '65°F to 70°F'
    };


    /* ============================================
       OPEN FINDER
    ============================================ */

    function openFinder() {

        modal.classList.add('is-open');

        modal.setAttribute('aria-hidden', 'false');

        trigger.setAttribute('aria-expanded', 'true');

        document.body.classList.add('zone-finder-open');

        window.setTimeout(() => {
            input.focus();
        }, 100);

    }



    /* ============================================
       CLOSE FINDER
    ============================================ */

    function closeFinder() {

        modal.classList.remove('is-open');

        modal.setAttribute('aria-hidden', 'true');

        trigger.setAttribute('aria-expanded', 'false');

        document.body.classList.remove('zone-finder-open');

    }


    /* ============================================
       TRIGGER BUTTON
    ============================================ */

    trigger.addEventListener('click', () => {

        if (modal.classList.contains('is-open')) {
            closeFinder();
        } else {
            openFinder();
        }

    });


    /* ============================================
       CLOSE BUTTON
    ============================================ */

    const closeElements =
        zoneFinder.querySelectorAll('[data-zone-finder-close]');

    closeElements.forEach((element) => {

        element.addEventListener('click', () => {

            closeFinder();

            trigger.focus();

        });

    });


    /* ============================================
       ESC KEY
    ============================================ */

    document.addEventListener('keydown', (event) => {

        if (
            event.key === 'Escape' &&
            modal.classList.contains('is-open')
        ) {

            closeFinder();

            trigger.focus();

        }

    });

    // ===============================================
    // UPDATE HEADER TEXT AFTER ZONE IS FETCHED
    // ===============================================

    function updateHeaderZone(zone) {

        if (!triggerText) return;

        if (zone) {
            triggerText.textContent =
                `Your Growing Zone is: ${zone.toUpperCase()}`;
        } else {
            triggerText.textContent =
                'Find Your Growing Zone';
        }

    }

    const savedZone =
        sessionStorage.getItem('bentleyGrowingZone');

    const savedZip =
        sessionStorage.getItem('bentleyGrowingZip');


    if (savedZone) {

        updateHeaderZone(savedZone);

        console.log(
            'Zone Finder: restored saved zone:',
            savedZone
        );

    }
    /* ============================================
       USDA DATA
       
       We only fetch the JSON the first time
       someone performs a search.
    ============================================ */

    let zoneData = null;


    async function loadZoneData() {

        // Already loaded
        if (zoneData) {
            return zoneData;
        }

        console.log(
            'Zone Finder: loading USDA data from:',
            dataUrl
        );


        const response = await fetch(dataUrl, {
            headers: {
                Accept: 'application/json'
            }
        });


        console.log(
            'Zone Finder: JSON response status:',
            response.status
        );


        if (!response.ok) {

            throw new Error(
                `Unable to load USDA zone data. HTTP ${response.status}`
            );

        }


        zoneData = await response.json();


        console.log(
            'Zone Finder: USDA data loaded successfully.'
        );

        console.log(
            'Zone Finder: ZIP codes loaded:',
            Object.keys(zoneData).length
        );


        return zoneData;

    }


    /* ============================================
       FORM SUBMISSION
    ============================================ */

    form.addEventListener('submit', async (event) => {

        event.preventDefault();


        /* ----------------------------
           ZIP
        ---------------------------- */

        const zip = input.value.trim();


        console.log(
            'Zone Finder: searching ZIP:',
            zip
        );


        /* ----------------------------
           Validate ZIP
        ---------------------------- */

        if (!/^\d{5}$/.test(zip)) {

            result.innerHTML = `
        <p class="zone-finder__error">
          Please enter a valid 5-digit ZIP code.
        </p>
      `;

            return;

        }


        /* ----------------------------
           Loading message
        ---------------------------- */

        result.innerHTML = `
      <p class="zone-finder__loading">
        Finding your growing zone...
      </p>
    `;


        try {

            /* ----------------------------
               Load USDA data
            ---------------------------- */

            const data = await loadZoneData();


            /* ----------------------------
               Find ZIP
            ---------------------------- */

            const zone = data[zip];


            console.log(
                `Zone Finder: ${zip} returned zone:`,
                zone
            );


            /* ----------------------------
               ZIP not found
            ---------------------------- */

            if (!zone) {

                result.innerHTML = `
          <p class="zone-finder__error">
            We couldn't find a USDA Hardiness Zone
            for ZIP code ${zip}.
          </p>
        `;

                return;

            }


            /* ----------------------------
               Temperature range
            ---------------------------- */

            const temperature =
                zoneTemperatures[zone.toLowerCase()] || '';


            /* ----------------------------
               Display result
            ---------------------------- */

            result.innerHTML = `
        <div class="zone-finder__success">

          <span class="zone-finder__result-label">
            Your USDA Hardiness Zone is
          </span>

          <div class="zone-finder__result-zone">
            Zone ${zone.toUpperCase()}
          </div>

          ${temperature
                    ? `
                <div class="zone-finder__temperature">
                  ${temperature}
                </div>
              `
                    : ''
                }

        </div>
      `;


        } catch (error) {

            console.error(
                'Zone Finder: lookup failed:',
                error
            );


            result.innerHTML = `
        <p class="zone-finder__error">
          Sorry, we couldn't look up your zone
          right now. Please try again.
        </p>
      `;

        }

    });


    console.log(
        'Zone Finder: initialized successfully.'
    );

}


/* ============================================
   INITIALIZE
============================================ */

if (document.readyState === 'loading') {

    document.addEventListener(
        'DOMContentLoaded',
        initZoneFinder
    );

} else {

    initZoneFinder();

}


/* ============================================
   SHOPIFY THEME EDITOR SUPPORT

   Reinitialize if Shopify reloads the
   header section in the theme editor.
============================================ */

document.addEventListener(
    'shopify:section:load',
    () => {

        console.log(
            'Zone Finder: Shopify section reloaded.'
        );

        initZoneFinder();

    }
);