function keyboard(){
	var keyboard = $('#scanID').getkeyboard();

  $('#scanID').keyboard({

      // set this to ISO 639-1 language code to override language set by
      // the layout: http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
      // language defaults to ["en"] if not found
      language: ['en'],
      rtl: false,

      // *** choose layout & positioning ***
      // choose from 'qwerty', 'alpha',
      // 'international', 'dvorak', 'num' or
      // 'custom' (to use the customLayout below)
      layout: 'custom',
      customLayout: {
        'default': [
          '1 2 3', '4 5 6', '7 8 9',
          '{accept} 0 {cancel}'
        ]
      },
      // Used by jQuery UI position utility
      position: {
        // null = attach to input/textarea;
        // use $(sel) to attach elsewhere
        of: $('#stName'),
        my: 'left top',
        at: 'left top',
        // used when "usePreview" is false
        at2: 'left bottom'
      },

      // allow jQuery position utility to reposition the keyboard on
      // window resize
      reposition: true,

      // true: preview added above keyboard;
      // false: original input/textarea used
      usePreview: true,

      // if true, the keyboard will always be visible
      alwaysOpen: false,

      // give the preview initial focus when the keyboard
      // becomes visible
      initialFocus: true,
      // Avoid focusing the input the keyboard is attached to
      noFocus: false,

      // if true, keyboard will remain open even if
      // the input loses focus.
      stayOpen: false,

      // Prevents the keyboard from closing when the user clicks or
      // presses outside the keyboard. The `autoAccept` option must
      // also be set to true when this option is true or changes are lost
      userClosed: false,

      // if true, keyboard will not close if you press escape.
      ignoreEsc: false,

     

      // Message added to the key title while hovering,
      // if the mousewheel plugin exists
      wheelMessage: 'Use mousewheel to see other keys',

      css: {
        // input & preview
        input: 'ui-widget-content ui-corner-all',
        // keyboard container
        container: 'ui-widget-content ui-widget ui-corner-all ui-helper-clearfix',
        // keyboard container extra class (same as container, but separate)
        popup: '',
        // default state
        buttonDefault: 'ui-state-default ui-corner-all',
        // hovered button
        buttonHover: 'ui-state-hover',
        // Action keys (e.g. Accept, Cancel, Tab, etc);
        // this replaces "actionClass" option
        buttonAction: 'ui-state-active',
        // Active keys
        // (e.g. shift down, meta keyset active, combo keys active)
        buttonActive: 'ui-state-active',
        // used when disabling the decimal button {dec}
        // when a decimal exists in the input area
        buttonDisabled: 'ui-state-disabled',
        // {empty} button class name
        buttonEmpty: 'ui-keyboard-empty'
      },

      // *** Useability ***
      // Auto-accept content when clicking outside the
      // keyboard (popup will close)
      autoAccept: false,
      // Auto-accept content even if the user presses escape
      // (only works if `autoAccept` is `true`)
      autoAcceptOnEsc: false,

      // Prevents direct input in the preview window when true
      lockInput: false,

      // Prevent keys not in the displayed keyboard from being
      // typed in
      restrictInput: false,
      // Additional allowed characters while restrictInput is true
      restrictInclude: '', // e.g. 'a b foo \ud83d\ude38'

      // Check input against validate function, if valid the
      // accept button is clickable; if invalid, the accept
      // button is disabled.
      acceptValid: true,
      // Auto-accept when input is valid; requires `acceptValid`
      // set `true` & validate callback
      autoAcceptOnValid: false,

      // if acceptValid is true & the validate function returns
      // a false, this option will cancel a keyboard close only
      // after the accept button is pressed
      cancelClose: true,

      // tab to go to next, shift-tab for previous
      // (default behavior)
      tabNavigation: false,

      // enter for next input; shift-enter accepts content &
      // goes to next shift + "enterMod" + enter ("enterMod"
      // is the alt as set below) will accept content and go
      // to previous in a textarea
      enterNavigation: false,
      // mod key options: 'ctrlKey', 'shiftKey', 'altKey',
      // 'metaKey' (MAC only)
      // alt-enter to go to previous;
      // shift-alt-enter to accept & go to previous
      enterMod: 'altKey',

      // if true, the next button will stop on the last
      // keyboard input/textarea; prev button stops at first
      // if false, the next button will wrap to target the
      // first input/textarea; prev will go to the last
      stopAtEnd: true,

      // Set this to append the keyboard immediately after the
      // input/textarea it is attached to. This option works
      // best when the input container doesn't have a set width
      // and when the "tabNavigation" option is true
      appendLocally: false,
      // When appendLocally is false, the keyboard will be appended
      // to this object
      appendTo: 'body',

      // If false, the shift key will remain active until the
      // next key is (mouse) clicked on; if true it will stay
      // active until pressed again
      stickyShift: true,

      // Prevent pasting content into the area
      preventPaste: false,

      // caret places at the end of any text
      caretToEnd: false,

      // caret stays this many pixels from the edge of the input
      // while scrolling left/right; use "c" or "center" to center
      // the caret while scrolling
      scrollAdjustment: 10,

      // Set the max number of characters allowed in the input,
      // setting it to false disables this option
      maxLength: 5,
      // allow inserting characters @ caret when maxLength is set
      maxInsert: true,

      // Mouse repeat delay - when clicking/touching a virtual
      // keyboard key, after this delay the key will start
      // repeating
      repeatDelay: 500,

      // Mouse repeat rate - after the repeatDelay, this is the
      // rate (characters per second) at which the key is
      // repeated. Added to simulate holding down a real keyboard
      // key and having it repeat. I haven't calculated the upper
      // limit of this rate, but it is limited to how fast the
      // javascript can process the keys. And for me, in Firefox,
      // it's around 20.
      repeatRate: 20,

      // resets the keyboard to the default keyset when visible
      resetDefault: false,

      // Event (namespaced) on the input to reveal the keyboard.
      // To disable it, just set it to ''.
      openOn: 'focus',

      // Event (namepaced) for when the character is added to the
      // input (clicking on the keyboard)
      keyBinding: 'mousedown touchstart',

      // enable/disable mousewheel functionality
      // enabling still depends on the mousewheel plugin
      useWheel: true,

      // combos (emulate dead keys)
      // if user inputs `a the script converts it to à,
      // ^o becomes ô, etc.
      useCombos: true,
      // if you add a new combo, you will need to update the
      // regex below
      combos: {
        // uncomment out the next line, then read the Combos
        //Regex section below
        '<': { 3: '\u2665' }, // turn <3 into ♥ - change regex below
        'a': { e: "\u00e6" }, // ae ligature
        'A': { E: "\u00c6" },
        'o': { e: "\u0153" }, // oe ligature
        'O': { E: "\u0152" }
      },

      // *** Methods ***
      // Callbacks - attach a function to any of these
      // callbacks as desired
      initialized: function(e, keyboard, el) {},
      beforeVisible: function(e, keyboard, el) {},
      visible: function(e, keyboard, el) {},
      beforeInsert: function(e, keyboard, el, textToAdd) { return textToAdd; },
      change: function(e, keyboard, el) {},
      beforeClose: function(e, keyboard, el, accepted) {},
      accepted: function(e, keyboard, el) {},
      canceled: function(e, keyboard, el) {},
      restricted: function(e, keyboard, el) {},
      hidden: function(e, keyboard, el) {},

      // called instead of base.switchInput
      // Go to next or prev inputs
      // goToNext = true, then go to next input;
      //   if false go to prev
      // isAccepted is from autoAccept option or
      //   true if user presses shift-enter
      switchInput: function(keyboard, goToNext, isAccepted) {},

      /*
          // build key callback
          buildKey : function( keyboard, data ) {
            /* data = {
              // READ ONLY
              isAction: [boolean] true if key is an action key
              // name... may include decimal ascii value of character
              // prefix = 'ui-keyboard-'
              name    : [string]  key class name suffix
              value   : [string]  text inserted (non-action keys)
              title   : [string]  title attribute of key
              action  : [string]  keyaction name
              // html includes a <span> wrapping the text
              html    : [string]  HTML of the key;
              // DO NOT MODIFY THE ABOVE SETTINGS

              // use to modify key HTML
              $key    : [object]  jQuery selector of key already added to keyboard
            }
            * /
            data.$key.html('<span class="ui-keyboard-text">Foo</span>');
            return data;
            },
          */

      // this callback is called just before the "beforeClose"
      // to check the value if the value is valid, return true
      // and the keyboard will continue as it should (close if
      // not always open, etc)
      // if the value is not value, return false and the clear
      // the keyboard value ( like this
      // "keyboard.$preview.val('');" ), if desired
      
      //If input is accepted run this.
      accepted : function(event, keyboard, el) {
        console.log('The content "' + el.value + '" was accepted!');
        $("#scanID").removeClass("ui-keyboard-input");
        $("#scanID").removeClass("ui-widget-content");
        $("#scanID").removeClass("ui-corner-all");
        $("#scanID").removeClass("ui-keyboard-input-current");

        $( "#scanSubmit" ).trigger( "click", function(){
          alert('Scan Barcode button clicked');
        });
      },
      //if input is canceled run this
      canceled : function(event, keyboard, el) {
        console.log('changes canceled, value restored to ' + el.value);
        location.reload();
      },

      validate: function(keyboard, value, isClosing) {
        return true;
      }

    })
      // activate the typing extension
      .addTyping({
        showTyping: true,
        delay: 250
      });

  	$('#scanID').getkeyboard().reveal();
    document.getElementById("scanID").focus();
  }