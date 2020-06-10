LS.data = {
    cart: {
        subtotal: 0,
        total: 0,
        shipping: 0
    }
};

LS.events = {
    productAddedToCart: 'productAddedToCart'
};

LS.setup = function(){
    LS.setupCart();

    // Also set up the "back to admin" bar
    LS.backToAdminEffect();
};

LS.setupCart = function(){
    var totalPriceRaw = $('.total-price').data('priceraw');

    var hasAjaxCart = typeof totalPriceRaw === 'undefined' || totalPriceRaw === false;
    if(hasAjaxCart) {
      // In ajax cart tpls the subtotal is the total, will be fixed but to be compatible with old stores
      // we must use this.
      totalPriceRaw = $('.subtotal-price.hidden').data('priceraw');
      var newShipping = $('.js-has-new-shipping').data('priceraw');
      if(newShipping) {
          // In ajax cart tpls the subtotal is the total, will be fixed but to be compatible with old stores
          // we must use this.
          totalPriceRaw = newShipping;
      }
    }

    LS.data.cart.total = parseFloat(totalPriceRaw);
};

LS.on = function(event, callback){
    if(LS.events.hasOwnProperty(event) && typeof $(LS).on === "function"){
        $(LS).on(event, callback);
    }
};

LS.trigger = function(event, extra){
    if(typeof $(LS).trigger === "function"){
        $(LS).trigger(event, extra);
    }
};

/*
LS.sortByMobile();
*/
LS.sortByMobile = function(config_override) {
    var config = {
        trigger_selector : '#openFilterMobOverlay',
        container_selector : '#filterMobOverlay'
    };
    $.extend( config, config_override );
    $( config.trigger_selector ).click(function(){

        $( config.container_selector ).slideToggle(150);

    });
};

//V3.01.A - http://www.openjs.com/scripts/jx/
//Added xmlHttpRequest.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
LS.ajax = {getHTTPObject:function(){var A=false;if(typeof ActiveXObject!="undefined"){try{A=new ActiveXObject("Msxml2.XMLHTTP")}catch(C){try{A=new ActiveXObject("Microsoft.XMLHTTP")}catch(B){A=false}}}else{if(window.XMLHttpRequest){try{A=new XMLHttpRequest()}catch(C){A=false}}}return A},load:function(url,callback,format,method,opt){var http=this.init();if(!http||!url){return }if(http.overrideMimeType){http.overrideMimeType("text/xml")}if(!method){method="GET"}if(!format){format="text"}if(!opt){opt={}}format=format.toLowerCase();method=method.toUpperCase();var now="uid="+new Date().getTime();url+=(url.indexOf("?")+1)?"&":"?";url+=now;var parameters=null;if(method=="POST"){var parts=url.split("?");url=parts[0];parameters=parts[1]}http.open(method,url,true);http.setRequestHeader('X-Requested-With', 'XMLHttpRequest');if(method=="POST"){http.setRequestHeader("Content-type","application/x-www-form-urlencoded");http.setRequestHeader("Content-length",parameters.length);http.setRequestHeader("Connection","close")}var ths=this;if(opt.handler){http.onreadystatechange=function(){opt.handler(http)}}else{http.onreadystatechange=function(){if(http.readyState==4){if(http.status==200){var result="";if(http.responseText){result=http.responseText}if(format.charAt(0)=="j"){result=result.replace(/[\n\r]/g,"");result=eval("("+result+")")}else{if(format.charAt(0)=="x"){result=http.responseXML}}if(callback){callback(result)}}else{if(opt.loadingIndicator){document.getElementsByTagName("body")[0].removeChild(opt.loadingIndicator)}if(opt.loading){document.getElementById(opt.loading).style.display="none"}if(error){error(http.status)}}}}}http.send(parameters)},bind:function(A){var C={"url":"","onSuccess":false,"onError":false,"format":"text","method":"GET","update":"","loading":"","loadingIndicator":""};for(var B in C){if(A[B]){C[B]=A[B]}}if(!C.url){return }var D=false;if(C.loadingIndicator){D=document.createElement("div");D.setAttribute("style","position:absolute;top:0px;left:0px;");D.setAttribute("class","loading-indicator");D.innerHTML=C.loadingIndicator;document.getElementsByTagName("body")[0].appendChild(D);this.opt.loadingIndicator=D}if(C.loading){document.getElementById(C.loading).style.display="block"}this.load(C.url,function(E){if(C.onSuccess){C.onSuccess(E)}if(C.update){document.getElementById(C.update).innerHTML=E}if(D){document.getElementsByTagName("body")[0].removeChild(D)}if(C.loading){document.getElementById(C.loading).style.display="none"}},C.format,C.method,C)},init:function(){return this.getHTTPObject()}}

LS.removeElement = function(element) {
    if (element.parentNode) {
        element.parentNode.removeChild(element);
    }
};

LS.clone = function clone(obj) {
    if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = obj.constructor();

    for(var key in obj) {
        temp[key] = clone(obj[key]);
    }
    return temp;
};

LS.newsletter = function(newsletter_selector, newsletter_modal_selector, url, callback ) {
    $( newsletter_selector ).on( "submit", function( event ) {
        event.preventDefault();
        var siteblindado_regex = /^scan[0-9]*@siteblindado\.com\.br$/;
        if (!siteblindado_regex.test($("#newsModal form").find("input[name='email']").val()) || !siteblindado_regex.test($("#news-popup-form").find("input[name='email']").val())) {
            var newsletter = this;
            var $newsletter_modal = $(newsletter_modal_selector);
            var data = $newsletter_modal.find("form").serialize();
            $.post(url, data, function (response) {
                if (response.success) {
                    // Amplitude event only if store has tag amplitude_enabled
                    amplitude_log_event('newsletter_subscribe', {"source":"popup"});
                }
                callback.call(newsletter, response);
            });
        } else {
        $("#newsModal .loading-modal").hide();
        $("#newsModal input[type='submit']").prop("disabled", false);

        // New improved selectors 
        $(".js-news-spinner").hide();
        $("#news-popup-form input[type='submit']").prop("disabled", false);

        }
    });
    return false;
};

// Script with regex to avoid spam from siteforte with emails like: scan@siteblindado.com.br or scan12n@siteblindado.com.br
LS.newsletter_avoid_siteblindado_bot = function(){
    var $newsletter_form = $("#newsletter form, .js-newsletter-footer form, #news-popup-form");
    var $newsletter_input = $newsletter_form.find("input[name='email']");
    $newsletter_form.submit(function(e) {
       var siteblindado_regex = /^scan[0-9]*@siteblindado\.com\.br$/;
       if (!siteblindado_regex.test($newsletter_input.val())) {
           return;
       }
       e.preventDefault();
   });
};

LS.getUrlParams = function(){
    var urlParams = {};
    (function () {
        var match,
            pl     = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            query  = window.location.search.substring(1);

        while (match = search.exec(query))
            urlParams[decode(match[1])] = decode(match[2]).replace('+', '%2B');
    })();

    return LS.clone(urlParams);
};

// We never want to remember "mpage". It's used by hybrid scroll to populate the page after hitting the back button.
// Carrying it around can cause unnecessary preloading of results
LS.urlParams = LS.getUrlParams();
delete LS.urlParams.mpage;

LS.resetItems = function(){
    $("#shipping-calculator-form, .shipping-calculator-form, .js-shipping-calculator-form").show();
    $("#shipping-calculator-response, .shipping-calculator-response, .js-shipping-calculator-response").hide();
    
    return false;
};

LS.addToCart = function(form, btn_text, btn_text_disabled, text_stock, is_ajax_editable){
    var params = form.serializeArray();
    var url = form.attr('action');
    var $button = form.find(".js-addtocart");
    $.ajax({
      method: "POST",
      url: url,
      data: params,
      beforeSend: function( xhr ) {
        $button.attr('disabled', 'disabled').val(btn_text_disabled);
      }
    })
    .done(function(response) {
        if (response.success) {
            var qmodal = form.closest(".modal");
            if (qmodal.length>0) { qmodal.modal('hide'); }
            if (jQuery.fancybox) { jQuery.fancybox.close(); }
            $button.attr('disabled', false).val(btn_text);
            LS.updateCart(response.cart, is_ajax_editable);
            LS.freeShippingLabelUpdate(response.free_shipping);
            LS.refreshTotals(response);
            jQuery("#ajax-cart-shipping .shipping-calculator-response, #ajax-cart-shipping .js-shipping-calculator-response").hide().empty();
            $(".js-empty-ajax-cart").hide();
            $(".js-visible-on-cart-filled").show();

            LS.trigger(LS.events.productAddedToCart, {
                cart_item: response.item,
                quantity_added: response.quantity_added
            });

        } else {
            $button.attr('disabled', false).val(btn_text);
            $("<div class='alert alert-warning'>"+text_stock+"</div>").insertAfter($button).delay( 5000 ).fadeOut( 500 );
        }
    });
};

LS.updateCart = function(cart, is_ajax_editable){
            jQuery("#cart-total").html(cart.total_short);
            jQuery("#cart-table-total").html(cart.total_short);
            // get the actual amount of items
            var products_count = 0;
            for (i = 0; i < cart.products.length; i++) { 
                products_count = products_count + parseInt(cart.products[i].quantity);
            }
            jQuery("#cart-amount").html(products_count);
            var table = jQuery(".ajax-cart");
            table.html('');
            for (i = 0; i < cart.products.length; i++) {
                if (is_ajax_editable){
                    table.append("<div class='overflow-none ajax-cart-item productrow p-relative' data-item-id="+cart.products[i].id+"><div class='ajax-cart-item_image-col p-half-top p-half-bottom p-quarter-left p-quarter-right text-center ajax-cart-item_item-row'><img src="+cart.products[i].image.src+" class='ajax-cart-item_img full-width'/></div><div class='ajax-cart-item_desc-col p-half-top p-half-right p-half-bottom p-quarter-left ajax-cart-item_item-row full-width text-wrap'><a class='ajax-cart-item-link' href='"+cart.products[i].url+"'>"+cart.products[i].name+"</a><div class='ajax-cart-item_unit-price m-quarter-top pull-left full-width'> "+cart.products[i].price_short+" </div><div class='js-ajax-cart-qty-container ajax-cart-item_qty-container pull-left m-quarter-top'> <button type='button' class='item-minus js-ajax-cart-qty-btn ajax-cart-item_qty-btn pull-left m-none-top p-half-all-xs' onclick='LS.minusQuantity("+ cart.products[i].id +", true)'><i class='fa fa-minus ajax-cart-item_qty-btn-icon'></i></button> </button> <div class='quantity-input ajax-cart-item_qty-input-container pull-left'><input type='number' name='quantity["+ cart.products[i].id +"]' data-item-id="+cart.products[i].id+" value="+cart.products[i].quantity+" class='ajax-cart-item_qty-input pull-left m-none text-center'/></div><button type='button' class='item-plus js-ajax-cart-qty-btn ajax-cart-item_qty-btn pull-left m-none-top p-half-all-xs' onclick='LS.plusQuantity("+ cart.products[i].id +", true)'><i class='fa fa-plus ajax-cart-item_qty-btn-icon'></i></button> </button> </div></div><div class='ajax-cart-item_subtotal-col col-subtotal text-right p-half-all ajax-cart-item_item-row font-bold'><span data-item-variant='"+cart.products[i].variant_id+"'>"+cart.products[i].subtotal_short+"</span></div><button type='button' class='item-delete js-ajax-cart-delete-btn ajax-cart-item_remove-btn m-quarter-top m-quarter-right m-half-left m-quarter-left-xs pull-left' onclick='LS.removeItem("+ cart.products[i].id +", true)'>&times;</button></div>");
                } else {
                    table.append("<div class='overflow-none ajax-cart-item'><div class='ajax-cart-item_image-col p-half-top p-half-bottom p-quarter-left p-quarter-right text-center ajax-cart-item_item-row'><img src=" +cart.products[i].image.src+ " class='ajax-cart-item_img full-width' /></div><div class='ajax-cart-item_desc-col p-half-all ajax-cart-item_item-row full-width text-wrap'><a class='ajax-cart-item-link' href='"+cart.products[i].url+"'>"+cart.products[i].name+"</a><br/>"+cart.products[i].price_short+"<br/><span class='ajax-cart-item_quantity-title'>x</span> <span class='ajax-cart-item_quantity-value'>"+cart.products[i].quantity+"</span></div><div class='ajax-cart-item_subtotal-col text-right p-half-all ajax-cart-item_item-row'>"+cart.products[i].subtotal_short+"</div></div>");
                }
            }
            if(cart.checkout_enabled) {
                $("#ajax-cart-minumum-div, .js-ajax-cart-minimum").hide();
                $("#ajax-cart-submit-div, .js-ajax-cart-submit").show();
            } else {
                $("#ajax-cart-submit-div, .js-ajax-cart-submit").hide();
                $("#ajax-cart-minumum-div, .js-ajax-cart-minimum").show();
            }

            jQuery("#ajax-cart-details").show();
            jQuery("#ajax-cart-backdrop").show();
        };

LS.toggleCart = function(){
    jQuery("#ajax-cart-details").toggle();
    jQuery("#ajax-cart-backdrop").toggle();
};

// New ajax cart functions

LS.addToCartEnhanced = function(form, btn_text, btn_text_disabled, text_stock, is_ajax_editable, callback, callback_error){
    var params = form.serializeArray();
    params.push({name: 'add_to_cart_enhanced', value: 1});
    var url = form.attr('action');
    var $button = form.find(".js-addtocart").not(".js-addtocart-placeholder");
    $.ajax({
      method: "POST",
      url: url,
      data: params,
      beforeSend: function( xhr ) {
        $button.attr('disabled', 'disabled').val(btn_text_disabled);
      }
    })
    .done(function(response) {
        if (response.success) {
            var qmodal = form.closest(".modal");
            if (qmodal.length>0) { qmodal.modal('hide'); }
            if (jQuery.fancybox) { jQuery.fancybox.close(); }
            $button.attr('disabled', false).val(btn_text);
            LS.updateCartEnhanced(response.cart, is_ajax_editable, callback, response.html_cart_items);
            
            LS.refreshTotals(response);

            // Updates free shipping message. If free shipping is achieved, automatic product shipping calculator is triggered
            LS.freeShippingLabelUpdate(response.free_shipping, true);

            jQuery(".js-ajax-cart-shipping .shipping-calculator-response, #ajax-cart-shipping .js-shipping-calculator-response").hide().empty();
            $(".js-empty-ajax-cart").hide();
            $(".js-visible-on-cart-filled").show();

            LS.trigger(LS.events.productAddedToCart, {
                cart_item: response.item,
                quantity_added: response.quantity_added
            });

            // Updates shipping when product is added to cart

            if (($(".js-shipping-calculator-with-zipcode").length) && $("#cart-shipping-container .js-shipping-input").val()) {
                $("#cart-shipping-container").show();
                LS.calculateShippingOnCart();
            }else{
                LS.updateShippingOnAddToCart();
            }

        } else {
            // Change value and text to support input type submit or button type submit
            $button.attr('disabled', false).val(btn_text);
            $("<div class='alert alert-warning'>"+text_stock+"</div>").insertAfter($button).delay( 5000 ).fadeOut( 500 );
            if (callback_error){
                callback_error();
            }
        }
    });
};

LS.updateCartEnhanced = function(cart, is_ajax_editable, callback, html_cart_items) {
    jQuery(".js-cart-widget-total").html(cart.total_short);
    jQuery(".js-ajax-cart-total").html(cart.total_short);

    // get the actual amount of items
    var products_count = 0;
    for (i = 0; i < cart.products.length; i++) { 
        products_count = products_count + parseInt(cart.products[i].quantity);
    }
    jQuery(".js-cart-widget-amount").html(products_count);

    var table = jQuery(".js-ajax-cart-list");

    table.html(html_cart_items);

    if(cart.checkout_enabled) {
        $(".js-ajax-cart-minimum").hide();
        $(".js-ajax-cart-submit").show();
    } else {
        $(".js-ajax-cart-submit").hide();
        $(".js-ajax-cart-minimum").show();
    }
    if (callback){
        callback();
    }
    else{
        jQuery(".js-ajax-cart-panel").show();
        jQuery(".js-ajax-backdrop").show();
    }
};


LS.onChangeVariants = [];

LS.registerOnChangeVariant = function(callback) {
    LS.onChangeVariants.push(callback);
};

LS.changeVariant = function(callback, element){
    //Get current variant
    var currentVariant = {}
    var selects;
    if (element){
        selects = jQuery(element).find("select[name^=variation]");
        if(selects.length == 0) {
            selects = jQuery(element).find("input[name^=variation]");
        }
        LS.variants = jQuery(element).data('variants');
    } else {
        selects = jQuery("select[name^=variation]");
        if(selects.length == 0) {
            selects = jQuery("input[name^=variation]");
        }
    }

    if (selects.is(':radio')){
        selects = selects.filter(':checked');
    }

    selects.each(function(index, select){
        var key = "option" + /variation\[(\d+)\]/.exec(jQuery(select).attr('name'))[1]
        currentVariant[key] = jQuery(select).val();
    });

    //Get match from LS.variations
    var data = null;
    jQuery.each(LS.variants, function(index, variant){
        var matches = true;
        jQuery.each(currentVariant, function(key, value){
            if (variant[key] != currentVariant[key]){
                matches = false;
            }
        });

        if (matches){
            data = variant;
        }
    });

    if (!data){
        data = {
            product_id: null,
            price_short: "—",
            price_long: "—",
            compare_at_price_short: null,
            compare_at_price_long: null,
            installments: null,
            installment_amount_short: null,
            installment_amount_long: null,
            available: false,
            stock: null,
            contact: true,
            id: null,
            sku: null,
            image: null,
            image_url: null
        }
    }

    data.element = element;
    callback(data);

    var i;
    for(i = 0; i < LS.onChangeVariants.length; i++) {
        LS.onChangeVariants[i](data);
    }
};


// Backwards-compatibility
LS.updatePrice = function(select, priceId, format, callbackStock, callbackComparePrice){
    format = format != "short" ? "long" : format;

    LS.changeVariant(function(data){
        jQuery('#'+priceId).text(data["price_"+format]);
        if(callbackComparePrice) {
            callbackComparePrice(data["compare_at_price_"+format]);
        }
        if (callbackStock){
            callbackStock(data.available, data.stock);
        }
    });
};

LS.saveCalculatedShipping = function(on_click){

    // Get selected radio info

    const selected_method = $(".js-selected-shipping-method").attr('data-code');
    const cart_shipping_method_selected = $(".js-selected-shipping-method").attr('data-name');
    let price = $(".js-selected-shipping-method").closest(".js-shipping-radio").find('input').data('price');

    // Get selected shipping method value for cart

    const cart_shipping_method_price = $(".js-selected-shipping-method").attr('data-cost');

    // Save shipping option 

    LS.saveShippingSelected(selected_method, cart_shipping_method_selected, price, cart_shipping_method_price, true);

    // Reflect selected shipping option on cart 

    $("#cart-selected-shipping-method").text(cart_shipping_method_selected).attr( "data-code", selected_method );

    // Excute this only if function is triggered by click or change

    if(on_click){

        // Change cart total price 

        let shippingPrice = $(".js-selected-shipping-method").attr("data-price");
        LS.addToTotal(shippingPrice);

        let total = (LS.data.cart.total / 100) + price;
        $(".js-cart-widget-total").html(LS.formatToCurrency(total));
    }

    $(".js-cart-total").addClass('js-cart-saved-shipping');
}


LS.calculateShippingOnCart = function(){

    // Calculate shipping on cart

    // Get store shipping url

    var shipping_url = $("#cart-shipping-container").data("shipping-url");

    // Recalculate shipping programatically

    // For themes without cart ajax

    if($("#cart-shipping-container").hasClass("js-cart-page-calculator")){
        LS.calculateShipping($("#shipping-zipcode").val(), shipping_url );
    }else{

    // For themes with cart ajax 
    
        LS.calculateShippingAjax(
        $("#cart-shipping-container .js-shipping-input, #shipping-zipcode").val(),
        shipping_url,
        $("#cart-shipping-container").closest(".js-shipping-calculator-container"));
    }
}

LS.updateShippingOnAddToCart = function() {
    
    // Updates shipping everytime a product is added to cart - Only for stores with new HTML (js-has-new-shipping)
    
    if($(".js-has-new-shipping").length){
        $(".js-shipping-method-unavailable").hide();
        $("#cart-shipping-container").show();
        
        // If user already had calculated shipping and there is no store branch selected: recalculate shipping, hide the old shipping cost and show "calculating" wording.

        if($("#cart-shipping-container .js-shipping-input, #shipping-zipcode").val()){

            // Updates shipping when product is added to cart

            LS.calculateShippingOnCart();
        }
    }
};

LS.updateShippingOnCartChange = function() {

    // Updates shipping when cart is changed
            
    // Get store shipping url

    var shipping_url = $("#cart-shipping-container").data("shipping-url");

    // Recalculate shipping programatically

    LS.calculateShippingOnCart();

};

LS.updateShippingProduct = function(notAjaxCart) {

    if(notAjaxCart){
        // Calculate shipping on product calculator for stores with tag insight-shipping-polish

        if (($(".js-shipping-calculator-with-zipcode").length) && ($("#product-shipping-container").length) && ($("#shipping-zipcode").val())) {

            var product_shipping_url = $("#product-shipping-container").data("shipping-url");

            LS.calculateShipping($("#shipping-zipcode").val(), product_shipping_url );

        }
    } else{

        // Calculate shipping on product calculator for stores with tag insight-shipping-polish

        if (($(".js-shipping-calculator-with-zipcode").length) && ($("#product-shipping-container").length) && ($("#product-shipping-container .js-shipping-input").val())) {

            var product_shipping_url = $("#product-shipping-container").data("shipping-url");

            LS.calculateShippingAjax(
            $("#product-shipping-container").find(".js-shipping-input").val(),
            product_shipping_url,
            $("#product-shipping-container").closest(".js-shipping-calculator-container"));

        }
    }
};

LS.reflectCalculatedShipping = function() {

    // Updates calculated shipping on cart total - Only for stores with new HTML (js-has-new-shipping)

    if($(".js-has-new-shipping").length){

        // Get the selected shipping method id (data-code)      
        const selected_method_data = $("#cart-selected-shipping-method").attr('data-code');

        // Get the selected shipping radio button
        const selected_method_radio = $(".js-shipping-method[data-code='" + selected_method_data + "'], .js-branch-method[data-code='" + selected_method_data + "']");

        // After showing the results if the selected shipping radio button is still available (in the DOM), select it again to maintain previous user selected method
        if(selected_method_radio.length){

            // Reset all shipping methods with class "js-selected-shipping-method"
            $(".js-shipping-method, .js-branch-method").removeClass('js-selected-shipping-method');
            
            // Maintain selection after calculation from previously selected option
            selected_method_radio.addClass('js-selected-shipping-method').prop("checked", true);

            LS.saveCalculatedShipping();

        // After showing the results if the selected shipping radio button is NOT avalable (because the weight of the cart is too much). Show  an alert

        }else{

            // Only show shipping unavailable alert if user already calculated at least once. This to avoid showing the alert on the first calculation of the flow
            if($(".js-cart-total").hasClass('js-cart-saved-shipping')){
                $(".js-shipping-method-unavailable").show();
            }

            // Reset calculated shipping cost and cart total
            LS.resetCalculatedShipping();
        }
    }
};

LS.resetCalculatedShipping = function() {

    // Resets calculated shipping and removes it from cart total - Only for stores with new HTML (js-has-new-shipping)

    if($(".js-has-new-shipping").length){

        $(".js-cart-total").removeClass('js-cart-saved-shipping');

        // Clear saved shipping option
        LS.saveShippingSelected(null, "", 0, "0", false);

        // Remove shipping cost to ajax cart widget and cart total
        let price = 0;
        let total = (LS.data.cart.total / 100) + price;
        $(".js-cart-widget-total, .js-cart-total").html(LS.formatToCurrency(total));

        // Remove shipping cost for cart total
        $(".js-cart-total").attr('data-priceraw', total * 100);


        // Reset cart installments removing shipping
        LS.refreshTotalInstallments(total);

        // Uncheck selected radio button and remove attr from previous saved option
        $(".js-selected-shipping-method").removeClass('js-selected-shipping-method').removeAttr('checked');
    }

};

LS.calculateShipping = function(cep, url2Post) {

    // Hides shipping unavailable alert - Only for stores with new HTML (js-has-new-shipping)

    if($(".js-has-new-shipping").length){

        // Hide unavailable shipping method (due to cart weight) alert always when shipping is calculated
        $(".js-shipping-method-unavailable, .js-calculate-shipping-wording").hide();
        $(".js-calculating-shipping-wording").show();
    }

    var params = {'cep': cep};
    var variant = jQuery("#shipping-variant-id");
    if(variant.length) {
        params['variant_id'] = variant.val();
    }
    //All but .js-product-form .js-product-quantity are being used for backwards compatibility
    var quantity = jQuery("#product_form .quantity input, #product_form .js-product-quantity, .js-product-form .quantity input, .js-product-form .js-product-quantity");
    if (quantity.length) {
        var val = quantity.val();
        params['quantity'] = (val > 0 ? val : 0);
    }
    var shipping_calculator = jQuery("#shipping-calculator");
    var shipping_calculator_loading = shipping_calculator.find(".loading, .js-shipping-loading");
    shipping_calculator_loading.show();
    if ($(".js-shipping-calculator-with-zipcode").length) {
        $(".js-shipping-calculator-spinner").fadeIn();
    }
    jQuery("#shipping-calculator-response, .shipping-calculator-response, .js-shipping-calculator-response").hide();
    jQuery(".js-ship-calculator-error").hide();

    if (jQuery('.js-cart-contents').length || jQuery('div#ajax-cart-details').length) {
        var cartTotal = LS.data.cart.total / 100;
        jQuery("div.total-price").html("Total: " + LS.formatToCurrency(cartTotal));
        jQuery("div.total-price").attr('data-priceraw', cartTotal * 100);

        // New total and subtotal updated without adding hardcoded wording 
        jQuery(".js-cart-total").html(LS.formatToCurrency(cartTotal));
        jQuery(".js-cart-total").attr('data-priceraw', cartTotal * 100);
    }

    if ($(".js-shipping-calculator-with-zipcode").length) { 
        // Remove modify height container for error message
        $(".js-shipping-calculator-head").removeClass("with-error");
    }
    
    jQuery.post(url2Post, params, function(data) {
        shipping_calculator_loading.hide();
        if ($(".js-shipping-calculator-with-zipcode").length) {
            $(".js-shipping-calculator-spinner").slideUp();
        }
        if(data.success) {
            jQuery("#shipping-calculator-response, .shipping-calculator-response, .js-shipping-calculator-response").html(data.html);
            jQuery("#shipping-calculator-response, .shipping-calculator-response, .js-shipping-calculator-response").show();

            // Show shipping results modal after calculating only if the user is using the shipping calculator directly and not on cart manipulation - Only for stores with new HTML (js-has-new-shipping)

            if($(".js-has-new-shipping").length){

                $(".js-shipping-suboption-select, .js-shipping-suboption-list").hide();

                if($('#shoppingCartPage').length){

                    // Maintain previously calculated shipping on new successfull calculation
                    LS.reflectCalculatedShipping();

                    // Show suboptions select
                    $(".js-shipping-suboption-select, .js-cart-shipping-label").show();
                    $(".js-shipping-suboption-list, .js-shipping-suboption-product, .js-product-shipping-label").hide();
                }else{

                    // Show suboptions list
                    $(".js-shipping-suboption-list, .js-shipping-suboption-product, .js-product-shipping-label").show();
                    $(".js-shipping-suboption-select, .js-cart-shipping-label").hide();
                }
            }

            // Save zipcode by cookie (validating the presence of js-cart-saved-zipcode). Only for stores with insight-shipping-polish tag 

            if (($(".js-shipping-calculator-with-zipcode").length) && ((typeof $.cookie('calculator_zipcode') === 'undefined') || (zipcode_from_cookie != cep)) ) {
                var zipcode_from_cookie = $("#shipping-zipcode").val();
                $.cookie('calculator_zipcode', zipcode_from_cookie, { path: '/', expires: 60 }); 
            }

            // Adjust the height of the container of the shipping calculator, hide the form and show the zipcode with which the shipping cost is calculated.

            if ($(".js-shipping-calculator-with-zipcode").length) {
                $(".js-shipping-calculator-head").removeClass("with-form").addClass("with-zip");
                $("#shipping-calculator-form").removeClass("transition-up-active");
                $(".js-shipping-calculator-with-zipcode").addClass("transition-up-active");
                $(".js-shipping-calculator-current-zip").text(cep);
            }

        } else {
            if ('error' in data && data.error != 'common-error') {
                if (data.error == 'invalid-zipcode') {
                    jQuery("#invalid-zipcode").show();
                } else if (data.error == 'external-error') {
                    jQuery('.js-ship-calculator-external-error').show();
                } else {
                    jQuery('.js-ship-calculator-common-error').show();
                }

                if($('#shoppingCartPage').length){

                    // Reset calculated shipping cost and cart total
                    LS.resetCalculatedShipping();
                }

                if ($(".js-shipping-calculator-with-zipcode").length) { 

                    // Modify height container for error message
                    $(".js-shipping-calculator-head").addClass("with-error");
                }

                // Clear zipcode cookie on error 
                     
                if (((!$(".js-cart-saved-zipcode").length) && $(".js-shipping-calculator-with-zipcode").length)) {
                    $.removeCookie('calculator_zipcode', { path: '/' });
                }

            } else {
                jQuery('.js-ship-calculator-common-error').show();

                if($('#shoppingCartPage').length){

                    // Reset calculated shipping cost and cart total
                    LS.resetCalculatedShipping();
                }
            }
            jQuery("#shipping-calculator-response, .shipping-calculator-response, .js-shipping-calculator-response").hide().empty();
        }

        if($(".js-has-new-shipping").length){
            $(".js-calculating-shipping-wording").hide();
            $(".js-calculate-shipping-wording").show();
        }

    }, 'json');

    return false;    
};
LS.calculateShippingAjax = function(cep, url2Post, container) {

    // Hides shipping unavailable alert - Only for stores with new HTML (js-has-new-shipping)

    if($(".js-has-new-shipping").length){

        // Hide unavailable shipping method (due to cart weight) alert always when shipping is calculated
        container.find(".js-shipping-method-unavailable, .js-calculate-shipping-wording").hide();
        container.find(".js-calculating-shipping-wording").show();
    }

    // Shipping cost table (Used by theme Idea)

    if ($(".js-shipping-cost-table").length) { 
        if (!container.hasClass('js-product-detail')) {
            // Hide shipping cost while shipping is being calculated and display new wording
            $(".js-calculating-shipping-cost").show();
            $(".js-shipping-cost-empty").hide();
            $("#shipping-cost").hide();
        }
    }

    var params = {'cep': cep};

    // Shipping calculator with A/B JS

    if($(".js-has-new-shipping").length) {

        if(container.hasClass('js-product-detail')) {

            // Calculate shipping including product quantity only if calculation is made from product
            var variant = jQuery("#shipping-variant-id");
            if(variant.length) {
                params['variant_id'] = variant.val();
            }
            //All but .js-product-form .js-product-quantity are being used for backwards compatibility
            var quantity = jQuery("#product_form .quantity input, #product_form .js-product-quantity, .js-product-form .quantity input, .js-product-form .js-product-quantity, .js-product-form .js-quantity-input");
            if (quantity.length) {
                var val = quantity.val();
                params['quantity'] = (val > 0 ? val : 0);
            }
        }
    } else {
        // Calculate shipping including product quantity if ajax cart is display none or not present 
        if(!jQuery("#ajax-cart-details, #modal-cart") || jQuery("#ajax-cart-details, #modal-cart").length == 0 || jQuery("#ajax-cart-details, #modal-cart").is(":hidden")) {
            var variant = jQuery("#shipping-variant-id");
            if(variant.length) {
                params['variant_id'] = variant.val();
            }
            //All but .js-product-form .js-product-quantity are being used for backwards compatibility
            var quantity = jQuery("#product_form .quantity input, #product_form .js-product-quantity, .js-product-form .quantity input, .js-product-form .js-product-quantity");
            if (quantity.length) {
                var val = quantity.val();
                params['quantity'] = (val > 0 ? val : 0);
            }
        }
    }
    var shipping_calculator_loading = container.find(".loading, .js-shipping-loading");
    var zip_input = container.find("input[name='zipcode']");
    shipping_calculator_loading.show();
    if ($(".js-shipping-calculator-with-zipcode").length) {
        container.find(".js-shipping-calculator-spinner").fadeIn();
    }
    
    container.find(".js-ship-calculator-error").hide();
    container.find("#shipping-calculator-response, .shipping-calculator-response, .js-shipping-calculator-response").hide();
    zip_input.removeClass("input-error");

    if ($(".js-shipping-calculator-with-zipcode").length) { 
        // Remove modify height container for error message
        container.find(".js-shipping-calculator-head").removeClass("with-error");
    }

    // If calculation is made from the cart, refresh cart total
    
    if(jQuery("#ajax-cart-details, #modal-cart").css('display') != 'none' || $("#shoppingCartPage").length) {

        var cartTotal = LS.data.cart.total / 100;
        jQuery("div.total-price").html("Total: " + LS.formatToCurrency(cartTotal));
        jQuery("div.total-price").attr('data-priceraw', cartTotal * 100);
        LS.refreshTotalInstallments(cartTotal);

        // New total and subtotal updated without adding hardcoded wording 
        jQuery(".js-cart-total").html(LS.formatToCurrency(cartTotal));
        jQuery(".js-cart-total").attr('data-priceraw', cartTotal * 100);
    }

    jQuery.post(url2Post, params, function(data) {
        shipping_calculator_loading.hide();
        if ($(".js-shipping-calculator-with-zipcode").length) {
            container.find(".js-shipping-calculator-spinner").slideUp();
        }
        if(data.success) {

            container.find("#shipping-calculator-response, .shipping-calculator-response, .js-shipping-calculator-response").html(data.html);
            container.find("#shipping-calculator-response, .shipping-calculator-response, .js-shipping-calculator-response").show();
            jQuery("#single-product input.shipping-method, .js-product-detail input.js-shipping-method").remove();
            
            // Show or hide specific wording for cart or product calculation. Also reflects calculated shipping if made from cart - Only for stores with new HTML (js-has-new-shipping)

            if($(".js-has-new-shipping").length){

                if(!container.hasClass('js-product-detail')){

                    // Maintain previously calculated shipping on new successfull calculation
                    LS.reflectCalculatedShipping();

                    // Show suboptions select
                    container.find(".js-shipping-suboption-select, .js-cart-shipping-label").show();
                    container.find(".js-shipping-suboption-list, .js-shipping-suboption-product, .js-product-shipping-label").hide();

                    // Shipping cost table (Used by theme Idea)

                    if ($(".js-shipping-cost-table").length) {
                        // Display shipping cost after a sucessful zipcode recalculation
                        $(".js-calculating-shipping-cost").hide();
                        $("#shipping-cost").show();
                    }

                }else{

                    // Show suboptions list
                    container.find(".js-shipping-suboption-list, .js-shipping-suboption-product, .js-product-shipping-label").show();
                    container.find(".js-shipping-suboption-select, .js-cart-shipping-label").hide();
                }

                if($(".js-selected-shipping-method").hasClass("js-shipping-method-hidden")){

                    // Toggle other options visibility depending if they are pickup or delivery for cart and product at the same time

                    if($(".js-selected-shipping-method").hasClass("js-pickup-option")){

                        // If pickup selected on cart is a non-featured option, shows non-featured pickup options after calculation and hides non-featured delivery options

                        $(".js-other-pickup-options, .js-show-other-pickup-options .js-shipping-see-less").show();
                        $(".js-show-other-pickup-options .js-shipping-see-more").hide();

                        $(".js-other-shipping-options, .js-show-more-shipping-options .js-shipping-see-less").hide();
                        $(".js-show-more-shipping-options .js-shipping-see-more").show()

                    }else{

                        // If delivery selected on cart is a non-featured option, shows non-featured delivery options after calculation and hides non-featured pickup options

                        $(".js-other-shipping-options, .js-show-more-shipping-options .js-shipping-see-less").show();
                        $(".js-show-more-shipping-options .js-shipping-see-more").hide()

                        $(".js-other-pickup-options, .js-show-other-pickup-options .js-shipping-see-less").hide();
                        $(".js-show-other-pickup-options .js-shipping-see-more").show();

                    }          
                } else{

                    if($(".js-selected-shipping-method").hasClass("js-pickup-option")){

                        // If pickup selected on cart is a featured option, shows featured pickup options after calculation and hides non-featured delivery options

                        $(".js-other-pickup-options, js-other-shipping-options, .js-shipping-see-less").hide();
                        $(".js-shipping-see-more").show();

                    }else{

                        // If delivery selected on cart is a featured option, shows featured delivery options after calculation and hides non-featured pickup options

                        $(".js-other-shipping-options, .js-other-pickup-options, .js-shipping-see-less").hide();
                        $(".js-shipping-see-more").show()

                    }       
                }
            }

            // Save zipcode by cookie (validating the presence of js-cart-saved-zipcode). Only for stores with insight-shipping-polish tag

            if ($(".js-shipping-calculator-with-zipcode").length && ((typeof $.cookie('calculator_zipcode') === 'undefined') || (zipcode_from_cookie != cep)) ) {
                var zipcode_from_cookie = container.find(".js-shipping-input").val();
                $.cookie('calculator_zipcode', zipcode_from_cookie, { path: '/', expires: 60 });
            }

            if ($(".js-shipping-calculator-with-zipcode").length) {
                container.find(".js-shipping-calculator-head").removeClass("with-form").addClass("with-zip");
                container.find(".js-shipping-calculator-form").removeClass("transition-up-active");
                container.find(".js-shipping-calculator-with-zipcode").addClass("transition-up-active");
            }

        } else {
            if ('error' in data && data.error != 'common-error') {
                if (data.error == 'invalid-zipcode') {
                    container.find(".invalid-zipcode").show();
                } else if (data.error == 'external-error') {
                    container.find('.js-ship-calculator-external-error').show();
                } else {
                    container.find('.js-ship-calculator-common-error').show();
                }

                if ($(".js-shipping-calculator-with-zipcode").length) { 

                    // Modify height container for error message
                    container.find(".js-shipping-calculator-head").addClass("with-error");
                }

                if(!container.hasClass('js-product-detail') && !$(".js-branch-method").hasClass('js-selected-shipping-method')){

                    // Reset calculated shipping cost and cart total
                    LS.resetCalculatedShipping();
                }

                // Shipping cost table (Used by theme Idea)

                if ($(".js-shipping-cost-table").length) {
                    // Display reseted shipping cost wording if error
                    $(".js-calculating-shipping-cost").hide();
                    $(".js-shipping-cost-empty").show();
                }

                // Clear zipcode cookie on error if there is no zipcode saved on cart from backend (validating the presence of js-cart-saved-zipcode). Only for stores with insight-shipping-polish tag
                     
                if (((!$(".js-cart-saved-zipcode").length) && $(".js-shipping-calculator-with-zipcode").length)) {
                    $.removeCookie('calculator_zipcode', { path: '/' });
                }
                                
            } else {
                container.find('.js-ship-calculator-common-error').show();

                if(!container.hasClass('js-product-detail') && !$(".js-branch-method").hasClass('js-selected-shipping-method')){
                    
                    // Reset calculated shipping cost and cart total
                    LS.resetCalculatedShipping();
                }
            }
            container.find("#shipping-calculator-response, .shipping-calculator-response, .js-shipping-calculator-response").hide().empty();
            zip_input.addClass("input-error");

        }

        if($(".js-has-new-shipping").length){
            container.find(".js-calculating-shipping-wording").hide();
            container.find(".js-calculate-shipping-wording").show();
        }

    }, 'json');

    return false;    
};

LS.removeItem = function(itemID, isAjaxCart){
    var $go_to_checkout_btn = $("#go-to-checkout, .js-go-checkout-btn");
    $("#shipping-calculator-form, .shipping-calculator-form, .js-shipping-calculator-form").show();
    $("#shipping-calculator-response, .shipping-calculator-response, .js-shipping-calculator-response").hide().empty();
    
    $go_to_checkout_btn.attr( "disabled", "disabled" );       
    var minimum = jQuery('#shoppingCartPage').attr('data-minimum');
    // if cart.tpl is in his old version run the old function
    if (typeof minimum == 'undefined' && !isAjaxCart) {
        var input = jQuery("input[name='quantity["+itemID+"]']");
        input.val(0);
        input.closest("form").find("input[name='update']").click();
    } else {
    // if cart.tpl has the 'ajax' tags run the new function
    var quantity = {};
    quantity[itemID] = 0;    
    minimum = parseFloat(minimum);
    if (minimum>0) { minimum = minimum * 100; }
    else { minimum = 0 }

    jQuery('button.item-plus').attr('disabled','disabled');
    jQuery('button.item-minus').attr('disabled','disabled');
    // Improved selector
    jQuery('.js-cart-quantity-btn').attr('disabled','disabled');

    // added to avoid using always fa-cog
    jQuery('input[name="quantity['+itemID+']"]').closest(".js-cart-item").find(".js-cart-input-spinner").show();
    
    jQuery('input[name="quantity['+itemID+']"]').parent().empty().append('<i class="fa fa-cog fa-spin"></i>').show(".js-cart-input-spinner");

    jQuery('input[name="quantity['+itemID+']"]').hide();

    jQuery.ajax({
      url: "/cart/update/",
      method: "POST",
      data: { 'quantity': quantity },
      dataType: 'json',
      beforeSend: function() {
        $go_to_checkout_btn.attr( "disabled", "disabled" );  
      },
      success: function(data) {        
            var should_reload = false;
            if(data.success) {
                should_reload = LS.onItemDeleteSuccess(data, minimum, itemID, isAjaxCart);


            } else {
                alert("Server not responding. Please verify your internet connection.");
            }
            if(! should_reload) {
                $go_to_checkout_btn.removeAttr( "disabled" );
            }
        },
        error: function(){
          jQuery("#go-to-checkout, .js-go-checkout-btn").removeAttr( "disabled" );
        }
    });

    }

};

LS.onItemDeleteSuccess = function(data, minimum, itemID, isAjaxCart){
    var should_reload = false;
    var cartSubtotal = data.cart.subtotal * 100;
    if (minimum>0) {
        if (cartSubtotal >= minimum) {
            if ( jQuery("#go-to-checkout, .js-go-checkout-btn").length == 0 ) {
                should_reload = true;
                location.reload();
            }
        } else {
            if ( jQuery("#go-to-checkout, .js-go-checkout-btn").length > 0 ) {
                should_reload = true;
                location.reload();
            }
        }
    }
    
    if(data.cart.checkout_enabled) {
        $("#ajax-cart-minumum-div, .js-ajax-cart-minimum").hide();
        $("#ajax-cart-submit-div, .js-ajax-cart-submit").show();

    } else {
        $("#ajax-cart-submit-div, .js-ajax-cart-submit").hide();
        $("#ajax-cart-minumum-div, .js-ajax-cart-minimum").show();
    }

    jQuery('.productrow[data-item-id="'+itemID+'"]').slideUp("slow");
    jQuery('button.item-plus').removeAttr('disabled');
    jQuery('button.item-minus').removeAttr('disabled');

    // Improved selectors
    jQuery('.js-cart-quantity-btn').removeAttr('disabled');
    jQuery('.js-cart-item[data-item-id="'+itemID+'"]').slideUp("slow");

    // Once cart is updated, recalculate shipping or reselect branch when cart hast > 1 item - Only for stores with new HTML (js-has-new-shipping)

    if($("#cart-shipping-container .js-shipping-input, #shipping-zipcode").val() && $(".js-cart-item:visible").length > 1){
        LS.updateShippingOnCartChange();
    }

    // Hide added product label on product detail

    $(".js-added-to-cart-product-message").hide();

    // Update shipping on product detail

    LS.updateShippingProduct();

    LS.refreshTotals(data);
    LS.freeShippingLabelUpdate(data.free_shipping);

    if(data.cart.products.length == 0) {
        if (isAjaxCart){
            $(".js-empty-ajax-cart").show();
            $(".js-visible-on-cart-filled").hide();
        } else {
            should_reload = true;
            location.reload();
        }
        // If the cart item is removed successfully reset saved shipping
        LS.resetCalculatedShipping();
    }
    return should_reload;
};

LS.plusQuantity = function(itemID, isAjaxCart){
    var $go_to_checkout_btn = $("#go-to-checkout, .js-go-checkout-btn");
    $("#shipping-calculator-form, .shipping-calculator-form, .js-shipping-calculator-form").show();
    $("#shipping-calculator-response, .shipping-calculator-response, .js-shipping-calculator-response").hide().empty();

    $go_to_checkout_btn.attr( "disabled", "disabled" );  
    var itemVAL = jQuery('input[name="quantity['+itemID+']"]').val();
    itemVAL++;
    LS.changeQuantity(itemID, itemVAL, isAjaxCart);
};

LS.minusQuantity = function(itemID, isAjaxCart){
    var $go_to_checkout_btn = $("#go-to-checkout, .js-go-checkout-btn");
    $("#shipping-calculator-form, .shipping-calculator-form, .js-shipping-calculator-form").show();
    $("#shipping-calculator-response, .shipping-calculator-response, .js-shipping-calculator-response").hide().empty();

    var itemVAL = jQuery('input[name="quantity['+itemID+']"]').val();
    if (itemVAL>1) { 
        itemVAL--;
        $go_to_checkout_btn.attr( "disabled", "disabled" );  
        LS.changeQuantity(itemID, itemVAL, isAjaxCart);
    }
};

LS.changeQuantity = function(itemID, amount, isAjaxCart) {
    var $go_to_checkout_btn = $("#go-to-checkout, .js-go-checkout-btn");
    var quantity = {};
    quantity[itemID] = amount;
    var minimum = jQuery('#shoppingCartPage').attr('data-minimum');
    minimum = parseFloat(minimum);
    if (minimum>0) { minimum = minimum * 100; }
    else { minimum = 0 } 
    jQuery("#error-ajax-stock").hide();   
    
    jQuery('button.item-plus').attr('disabled','disabled');
    jQuery('button.item-minus').attr('disabled','disabled');
    // Improved selector
    jQuery('.js-cart-quantity-btn').attr('disabled','disabled');

    jQuery('input[name="quantity['+itemID+']"]').parent().append('<i class="fa fa-cog fa-spin"></i>');

    // Added to avoid using always fa-cog
    $('input[name="quantity['+itemID+']"]').closest(".js-cart-item").find(".js-cart-input-spinner").show();

    jQuery('input[name="quantity['+itemID+']"]').hide();
    var currentAmount = jQuery('input[name="quantity['+itemID+']"]').val();

    jQuery.post("/cart/update/", { 'quantity': quantity }, function(data) {
        if(data.success) {
            $go_to_checkout_btn.removeAttr("disabled");    
            var cartSubtotal = data.cart.subtotal * 100;
            if (minimum>0) {
                if (cartSubtotal >= minimum) {
                    if ( jQuery("#go-to-checkout, .js-go-checkout-btn").length == 0 ) location.reload();                
                } else {
                    $go_to_checkout_btn.attr( "disabled", "disabled" );  
                    if ( jQuery("#go-to-checkout, .js-go-checkout-btn").length > 0 ) location.reload();
                }
            }
            if(data.cart.checkout_enabled) {
                $("#ajax-cart-minumum-div, .js-ajax-cart-minimum").hide();
                $("#ajax-cart-submit-div, .js-ajax-cart-submit").show();
            } else {
                $("#ajax-cart-submit-div, .js-ajax-cart-submit").hide();
                $("#ajax-cart-minumum-div, .js-ajax-cart-minimum").show();
            }

            jQuery('button.item-plus').removeAttr('disabled');
            jQuery('button.item-minus').removeAttr('disabled');
            // Improved selector
            jQuery('.js-cart-quantity-btn').removeAttr('disabled');

            jQuery('input[name="quantity['+itemID+']"]').show();
            jQuery('input[name="quantity['+itemID+']"]').next().remove();

            // Added to avoid using always fa-cog
            $('input[name="quantity['+itemID+']"]').closest(".js-cart-item").find(".js-cart-input-spinner").hide();

            jQuery('input[name="quantity['+itemID+']"]').val(amount);

            LS.refreshTotals(data);            
            LS.freeShippingLabelUpdate(data.free_shipping);

            LS.trigger(LS.events.productAddedToCart, {
                cart_item: data.items[0], // It will always be one item here
                quantity_added: amount - currentAmount
            });

            // Once cart is updated, recalculate shipping or reselect branch - Only for stores with new HTML (js-has-new-shipping)
            if($(".js-has-new-shipping").length && $("#cart-shipping-container .js-shipping-input, #shipping-zipcode").val()){
                LS.updateShippingOnCartChange();
            }

            // Update shipping on product detail

            LS.updateShippingProduct();

        } else {
            $go_to_checkout_btn.removeAttr( "disabled" );       
            // IF NOT AVAILABLE STOCK
            var errorPH = jQuery("#error-ajax-stock").detach();        

            $(errorPH).insertAfter('.productrow[data-item-id="'+itemID+'"]');
            // Improved selector
            $(errorPH).insertAfter('.js-cart-item[data-item-id="'+itemID+'"]');
            errorPH.show();

            // If cart update is not successfull remain with the previous calculated shipping

            if($(".js-has-new-shipping").length && $("#cart-shipping-container .js-shipping-input, #shipping-zipcode").val()){
                LS.updateShippingOnCartChange();
            }

            // Update shipping on product detail

            LS.updateShippingProduct();

            jQuery('button.item-plus').removeAttr('disabled');
            jQuery('button.item-minus').removeAttr('disabled');
            // Improved selector
            jQuery('.js-cart-quantity-btn').removeAttr('disabled');

            jQuery('input[name="quantity['+itemID+']"]').show();
            jQuery('input[name="quantity['+itemID+']"]').next().remove();

            // Added to avoid using always fa-cog
            $('input[name="quantity['+itemID+']"]').closest(".js-cart-item").find(".js-cart-input-spinner").hide();

            jQuery('input[name="quantity['+itemID+']"]').val( data.errors[0].stock ); // the available stock
            if (data.errors[0].stock == 0){
                // If we don't have any stock, we must remove the product from the cart
                var should_reload = LS.onItemDeleteSuccess(data, minimum, itemID, isAjaxCart);
                if(!should_reload) {
                    $go_to_checkout_btn.removeAttr( "disabled" );
                }
            } else {
                var quantity = {};
                quantity[itemID] = data.errors[0].stock;
                jQuery.post("/cart/update/", { 'quantity': quantity }, function(data) {
                    if(data.success) {
                        LS.refreshTotals(data);
                        LS.freeShippingLabelUpdate(data.free_shipping);
                    }
                }, 'json');
            }
        }
    }, 'json');
};

LS.refreshTotalInstallments = function (price) {
  const max_installments_without_interest = $('.js-installments-cart-total').data('cart-installment');
  const interest = $('.js-installments-cart-total').data('interest');
  $('.js-cart-installments-amount').html(max_installments_without_interest);
  $('.js-cart-installments').html(LS.formatToCurrency((price * (1 + interest)) / max_installments_without_interest));
}

LS.refreshTotals = function(data) {

  jQuery.each(data.cart.products, function( index, value ) {
    // The first 2 are for backwards compatibility
    let selector = '.col-subtotal span[data-item-variant="'+value.variant_id+'"],' +
                   '.js-cart-item-subtotal[data-item-variant="'+value.variant_id+'"],' +
                   '.col-subtotal span[data-line-item-id="'+value.id+'"],' +
                   '.js-cart-item-subtotal[data-line-item-id="'+value.id+'"]';

    jQuery(selector).html(value.subtotal_short);
  });
  
  if (typeof data.item !== "undefined" && typeof data.item.product !== "undefined") {
    const installment = $('.js-installments-cart-total').data('cart-installment');
    let installment_product = 0;
    let interest = 0;
    const product_max_installments_without_interest = data.item.product.max_installments_without_interest != null ? data.item.product.max_installments_without_interest.installment : 0;
    const product_max_installments_with_interest = data.item.product.max_installments != null ? data.item.product.max_installments.installment : 0;
    if (product_max_installments_without_interest != 0 || product_max_installments_with_interest != 0) {
      installment_product = product_max_installments_without_interest > 1 ? product_max_installments_without_interest : product_max_installments_with_interest;
      interest = product_max_installments_without_interest > 1 ? data.item.product.max_installments_without_interest.installment_data.interest : data.item.product.max_installments.installment_data.interest;
    }
    if(installment <= 1 && installment_product > 1 ) {
      $('.js-installments-cart-total').data('cart-installment', installment_product);
      $('.js-installments-cart-total').data('interest', interest);
      $('.js-installments-cart-total').show();
      if (product_max_installments_without_interest > 1) {
        $('.js-installments-type-interest').show();
      }
    }
  }

  var promotions_applied = data.cart.promotional_discount.promotions_applied;

  if(promotions_applied){
      jQuery.each(promotions_applied, function( index, value ) {

        var id = value.scope_value_id ? value.scope_value_id : 'all';

        if(id == 'all'){
            var scope_value_name = $('.js-total-promotions span[class=js-promo-all]').text();
        }else{   
            var scope_value_name = value.scope_value_name;
        }

        if(value.discount_script_type == 'NAtX%off' ){
            var promotion_detail = value.selected_threshold.discount_decimal_percentage * 100 + '% OFF ' + $('.js-total-promotions .js-promo-in').text() + ' ' + scope_value_name + $('.js-total-promotions .js-promo-buying').text() + ' ' + value.selected_threshold.quantity + $('.js-total-promotions .js-promo-units-or-more').text() + ': ';
        }else{
            var promotion_detail = $('.js-total-promotions .js-promo-title').text() + ' ' + value.discount_script_type + ' ' + $('.js-total-promotions .js-promo-in').text() + ' ' + scope_value_name + ': ';
        }

        var promotion_price = value.total_discount_amount_short;
        var span_with_id_of_scope = 'span[id='+ id +']';
        
        if($(span_with_id_of_scope).length){
          $(span_with_id_of_scope).html( '<span class="cart-promotion-detail">' + promotion_detail + '</span>' + '<span class="cart-promotion-number font-bold"> -' + promotion_price + '</span>');
        }else{
          $(".js-total-promotions").append('<div class="p-quarter-top p-quarter-bottom"><span class="js-total-promotions-detail-row total-promotions-row" id='+ id + '>' + '<span class="cart-promotion-detail">' + promotion_detail + '</span>' + '<span class="cart-promotion-number font-bold"> -' + promotion_price + '</span></span></div>');
        }
      });

      var scope_value_ids = $.map(promotions_applied, function(n,i){
        return n.scope_value_id ? parseInt(n.scope_value_id) : 'all';
      });
  }

  $(".js-total-promotions-detail-row").each(function(){
    var id = this.id == 'all' ? this.id : parseInt(this.id);
    if ($.inArray(id, scope_value_ids) != -1) {
      $(this).show();
    }else{
      $(this).hide();
    }
  });

  LS.data.cart.total = data.cart.total * 100;
  LS.data.cart.subtotal = data.cart.subtotal * 100;

  jQuery("div.subtotal-price").html("Subtotal: "+data.cart.subtotal_short);
  jQuery("div.subtotal-price").attr("data-priceraw", data.cart.subtotal * 100);
  jQuery("div.total-price").html("Total: "+data.cart.total_short);
  jQuery("div.total-price").attr("data-priceraw", data.cart.total * 100);

  // New total and subtotal updated without adding hardcoded wording 
  jQuery(".js-cart-subtotal").html(data.cart.subtotal_short);
  jQuery(".js-cart-subtotal").attr("data-priceraw", data.cart.subtotal * 100);
  jQuery(".js-cart-total").html(data.cart.total_short);
  jQuery(".js-cart-total").attr("data-priceraw", data.cart.total * 100);

  LS.refreshTotalInstallments(data.cart.total);
  jQuery("#cart-total, .js-cart-widget-total").html(data.cart.total_short);
  var products_count = 0;
  for (i = 0; i < data.cart.products.length; i++) {
    products_count = products_count + parseInt(data.cart.products[i].quantity);
  }
  jQuery("#cart-amount, .cart-amount, .js-cart-widget-amount").html(products_count);

  // Show or cart heading wording 
  
  if(products_count > 1){
    jQuery(".js-cart-products-heading-plural").show();
    jQuery(".js-cart-products-heading-singular").hide();
  }else {
    jQuery(".js-cart-products-heading-plural").hide();
    jQuery(".js-cart-products-heading-singular").show();
  }
};

LS.addToTotal = function(amount) {
  var storeCurr = jQuery("#store-curr").html();
  var currency = "$";
  if (storeCurr=="BRL") currency = "R$";
  var currentTotalCents = LS.data.cart.total;
  var newTotal = currentTotalCents / 100 + parseFloat(amount);
  var newTotalCents = parseFloat(newTotal * 100).toFixed(2);
  var newTotalFormatted = LS.formatNumber(newTotal); // Format number
  jQuery("div.total-price").html("Total: "+currency+newTotalFormatted);
  jQuery("div.total-price").attr("data-priceraw", newTotalCents);
  LS.refreshTotalInstallments(newTotal);

  // New total and subtotal updated without adding hardcoded wording 
  jQuery(".js-cart-total").html(currency+newTotalFormatted);
  jQuery(".js-cart-total").attr("data-priceraw", newTotalCents);
};

LS.formatNumber = function(number) {
    number = parseFloat(number).toFixed(2);
    var cadena = number.toString();
    cadena = cadena.replace(".", ",");
    cadena = cadena.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.");
    return cadena;
};

LS.formatToCurrency = function(number) {
    var storeCurr = jQuery("#store-curr").html();
    var currency = "$";
    if (storeCurr=="BRL") currency = "R$";

    return currency + LS.formatNumber(number);
}

LS.backToAdminEffect = function() {

    jQuery(".btn-slide").click(function(){
        var anchor = jQuery(this);
        jQuery("#backToAdmin").slideToggle("slow", function(){anchor.toggleClass("slide-active");});
        return false;
    });
    jQuery('#backToAdmin').click(function() {
        jQuery('#backToAdmin').slideToggle('slow');
    });
};

LS.commentNotify = function(fb_comment_url, product_id, response) {
  jQuery.post(fb_comment_url, {
        'comment_id': response.commentID , 'product_id': product_id
  });
};

LS.swapProvinces = function(provinces) {
    var base_province = jQuery('form [name="province"]');
    if (provinces) {
        var new_elem = jQuery('<select>');
        for (i in provinces) {
            var name = provinces[i]['name'];
            new_elem.append(jQuery('<option></option>')
                .text(name)
                .attr('value', name)
                .attr('selected', base_province.val() == name)
            );
        }
    } else if (base_province.is('select')) {
        var new_elem = jQuery('<input type="text">');
    } else {
        return;
    }
    new_elem.attr('id', base_province.attr('id'));
    new_elem.attr('name', base_province.attr('name'));
    base_province.replaceWith(new_elem);
};

// From https://gist.github.com/nmsdvid/8807205
LS.debounce = function(a,b,c){var d;return function(){var e=this,f=arguments;clearTimeout(d),d=setTimeout(function(){d=null,c||a.apply(e,f)},b),c&&!d&&a.apply(e,f)}};

LS.hybridScroll = function(properties) {
    // Set some defaults
    var defaults = {
        debounceRate: 100,
        productGridSelector: '',
        spinnerSelector: '',
        loadMoreButtonSelector: '',
        hideWhileScrollingSelector: '',
        productsPerPage: 9,
        productsBeforeLoadMoreButton: 100,
        afterLoaded: function(){},
        template: null
    };

    properties = $.extend({}, defaults, properties);

    // Initialize elements
    var $spinner = $(properties.spinnerSelector);
    var $productGrid = $(properties.productGridSelector);
    var $loadMoreButton = $(properties.loadMoreButtonSelector);
    var $footerToHide = $(properties.hideWhileScrollingSelector);

    $spinner.hide();
    $loadMoreButton.hide();
    if ($productGrid.length == 0){
        console.log('Product grid not found. Hybrid scrolling not enabled.');
        return;
    }

    // State variables
    var page = 1;
    var lastPageAddedToHtml = 1;
    var prefetchedPagesQueue = [];
    var waitingAjaxResponse = false;
    var loadingStopped = false;
    var productsSinceLoadMoreButton = properties.productsPerPage;

    // These need to be calculated before potentially repopulating pages after clicking the  back button
    var startOfGridPosition = $productGrid.position().top;
    var pageHeight = $productGrid.height();
    

    // Register onscroll listener
    function startLoading(){
        loadingStopped = false;
        $(window).on("scroll", scrollHandler);
        $footerToHide.hide();
    }

    function stopLoading(){
        loadingStopped = true;
        $(window).off("scroll", scrollHandler);
        $footerToHide.show();
    }

    var scrollHandler = LS.debounce(function(e){
        if (shouldLoadNextPage()){
            $spinner.css('display', 'block');

            loadNextPage()
                .done(function(json){
                    appendResults(json);
                })
                .always(function(){
                    $spinner.css('display', 'none');
                });
        }
    }, properties.debounceRate);


    // Handle back button
    fetchPagesAfterBackButton();

    // Start listening to scroll events
    startLoading();


    // Has the user scrolled far enough to load the next page?
    function shouldLoadNextPage(){
        if (waitingAjaxResponse || loadingStopped){
            return false;
        }

        var currentPosition = $(window).scrollTop();
        var endOfGridPosition = startOfGridPosition + $productGrid.height();

        // Start loading 2 pages in advance
        return currentPosition + 2 * pageHeight >= endOfGridPosition;
    }


    // Load the next page via ajax. Returns a jquery deferred object.
    function loadNextPage(){
        waitingAjaxResponse = true;
        page++;

        // Build url for ajax
        var queryArgs = {
            results_only: true,
            limit: properties.productsPerPage,
            theme: LS.theme.code // To prevent responding with a cached response from a different theme
        };

        if (properties.template){
            queryArgs.template = properties.template;
        }

        var url = location.pathname;
        if (url.indexOf("/page/") == -1) {
            url = url.replace(/\/$/, '') + "/page/" + page + "/";
        } else {
            url = url.replace(/\/page\/(\d+)/, "/page/" + page);
        }

        // Do ajax
        var deferredResponse = $.get(url + buildQueryString(queryArgs), '', null, "json");

        deferredResponse.always(function() {
            waitingAjaxResponse = false;
        });

        deferredResponse.fail(function() {
            stopLoading();
        });

        return deferredResponse;
    }


    // Append html to product grid
    function appendResults(json, fromBackButton){
        var currentPageNum = parseInt(json.page);
        if (currentPageNum > lastPageAddedToHtml + 1){
            // Pages arrived out of order. Save this one until we get all the previous ones.
            prefetchedPagesQueue[currentPageNum] = json;
        } else {
            // Append enqueued pages first (potentially none)
            appendSinglePage(json, fromBackButton);
            for (var i = currentPageNum + 1; i < prefetchedPagesQueue.length; i++){
                if (prefetchedPagesQueue[i]){
                    appendSinglePage(prefetchedPagesQueue[i], fromBackButton);
                    delete prefetchedPagesQueue[i];
                } else {
                    break;
                }
            }
            properties.afterLoaded.call();
        }
    }

    // Axu for previous function
    function appendSinglePage(json, fromBackButton){
        if (json.has_results){
            if (!fromBackButton){
                storePageForBackButton(json);
                productsSinceLoadMoreButton += properties.productsPerPage;
            }

            lastPageAddedToHtml++;
            $productGrid.append(json.html);
        }

        if (!json.has_next) {
            stopLoading();
        } else if (!fromBackButton && productsSinceLoadMoreButton > properties.productsBeforeLoadMoreButton){
            showLoadMoreButton();
        }
    }


    // Stop the infinite scroll and show the load more button
    function showLoadMoreButton(){
        stopLoading();
        productsSinceLoadMoreButton = 0;

        // Preload next page before the user clicks on the button
        var deferredResponse = loadNextPage();

        $loadMoreButton.show();
        $loadMoreButton.one('click', function(){
            $loadMoreButton.hide();
            $spinner.css('display', 'block');

            deferredResponse
                .done(function(json) {
                    appendResults(json);
                    startLoading();
                })
                .always(function(){
                    $spinner.css('display', 'none');
                });
        });
    }

    // Save current page in url with history API for when the user clicks the back button in the browser
    function storePageForBackButton(json){
        var newUrl = location.pathname + buildQueryString({
            mpage: json.page,
        });
        history.replaceState({}, "", newUrl);
    }

    // Recall previously scrolled pages when the user clicks the back button in the browser
    function fetchPagesAfterBackButton(){
        // LS.urlParams filters mpage, so read the arguments fresh
        var args = LS.getUrlParams();

        if (args.mpage){
            for (var i = 2; i <= args.mpage; i++){
                loadNextPage().done(function(json){
                    appendResults(json, true);
                })
            }
        }

    }

    // Build url for ajax request
    function buildQueryString(args){
        var search = $.extend({}, LS.urlParams, args);

        var search_data = [];
        for (var search_key in search) {
            search_data.push(search_key + '=' + search[search_key]);
        }
        search_data = search_data.join('&');

        return '?' + search_data;
    }
};

LS.sendFrontendEvent = function (event, product, product_price){
    let params = '';
    if (typeof product != 'undefined') {
      params = '?product=' + encodeURI(product) + '&price=' + encodeURI(product_price);
    }
    $.ajax({
        method: "GET",
        url: '/stats/stats_frontend_event/'+ encodeURI(event) +'/' + params,
    });
};

LS.saveShippingSelected = function (code, name, price, price_text, selected){
    $.ajax({
      method: "POST",
      url: '/cart/save_shipping/',
      data: {
        selected: selected,
        code: code,
        name: name,
        price: price,
        price_text: price_text
      }
    });
};


LS.infiniteScroll = function(properties) {
    var $load_more_button = jQuery('#loadMoreBtn, .js-load-more-btn');
    this.afterSetup = properties.afterSetup ? properties.afterSetup : function(){};
    this.afterLoaded = properties.afterLoaded ? properties.afterLoaded : function(){};
    this.finishData = properties.finishData ? properties.finishData : function(){};
    this.productGridClass = properties.productGridClass ? properties.productGridClass : '';
    this.productsPerPage = properties.productsPerPage ? properties.productsPerPage : '9';
    this.loadingClass = properties.loadingClass ? properties.loadingClass : 'infinite-scroll-loading';
    this.loadingElement = properties.loadingElement ? properties.loadingElement : '<div class="' + this.loadingClass + '" style="display: none"></div>';
    this.template = properties.template ? properties.template : null;
    this.bufferPx = properties.bufferPx ? properties.bufferPx : 150;
    this.loadingEnded = false;
    this.loadingInProgress = false;
    this.page = 1;
    this.oldBehaviour = properties.oldBehaviour ? true : ($load_more_button.length ? false : true);

    if (this.oldBehaviour) {
        jQuery(window).scroll(function(context){
            return function() {
                if(jQuery(window).scrollTop() + context.bufferPx >= jQuery(document).height() - jQuery(window).height()){
                    context.paginate();
                }
            }
        }(this));
    } else {
        $load_more_button.click(function(context){
            return function() {
                context.paginate();
            }
        }(this));
    }

    this.afterSetup();
};

LS.infiniteScroll.prototype.paginate = function() {
    if(this.loadingInProgress || this.loadingEnded || this.productGridClass == undefined) {
        return;
    }
    this.loadingInProgress = true;

    if(this.loadingInProgress) {
        $('.loadingSpin, .js-load-more-spinner').css('display', 'block');
    }

    var search = LS.urlParams;
    this.page += 1;
    search['results_only'] = true;
    search['page'] = this.page;
    search['limit'] = this.productsPerPage;
    if (this.template){
        search['template'] = this.template;
    }

    var search_data = new Array();
    for (var search_key in search) {
        // Insert the items at the begining of the array, to avoid issue #13798
        search_data.splice(0, 0, search_key + '=' + search[search_key]);
    }
    search_data = search_data.join('&');
    if(document.querySelectorAll('.' + this.loadingClass).length == 0) {
        var grids = document.querySelectorAll('.' + this.productGridClass);
        for(var grids_key in grids) {
            grids[grids_key].innerHTML += this.loadingElement;
        }
    }
    var myProductsPerPage = this.productsPerPage;
    LS.ajax.bind({
        url : location.pathname + '?' + search_data,
        'onSuccess' : function(context){
            return function(data) {
                $('.loadingSpin, .js-load-more-spinner').css('display', 'none');
                var loading = document.querySelectorAll('.' + context.loadingClass);
                for(var loading_key in loading) {
                    LS.removeElement(loading[loading_key]);
                }
                if (data) {
                    var grids = document.querySelectorAll('.' + context.productGridClass);
                    for(var grids_key in grids) {
                        grids[grids_key].innerHTML += data;
                    }
                    context.afterLoaded(grids);
                    if($(data).first().hasClass('last-page') || $(data).first().find('.last-page').length != 0) {
                        context.loadingEnded = true;
                        context.finishData();
                    }
                } else {
                    context.loadingEnded = true;
                    context.finishData();
                }
                context.loadingInProgress = false;
            }
        }(this),
        'onError' : function(context){
            return function(data) {
                $('.loadingSpin, .js-load-more-spinner').css('display', 'none');
                var loading = document.querySelectorAll('.' + context.loadingClass);
                for(var loading_key in loading) {
                    LS.removeElement(loading[loading_key]);
                }
                context.loadingEnded = true;
                context.loadingInProgress = false;
            }
        }(this)
    });
};

LS.facebookLogin = function(facebookObject, callback) {
    facebookObject.login(function(responseLogin) {
        if (responseLogin.status === 'connected') {

            facebookObject.api('/me/permissions', function(responsePermissions) {
                var hasEmail = false;
                jQuery.each(responsePermissions.data, function(k, v) {
                    if (v['permission'] === 'email' &&
                        v['status'] === 'granted') {
                        hasEmail = true;
                    }
                });
                callback(responseLogin.status, hasEmail);
            });
        } else {
            callback(responseLogin.status, null);
        }
    }, { scope: 'public_profile,email', auth_type: 'rerequest' });
};

LS.urlAddParam = function(paramKey, paramValue, additive=false) {
    var params = LS.urlParams;
    paramValue = paramValue.toString().replace('+', '%2B');
    if(additive && params[paramKey] !== undefined){
        var paramValues = params[paramKey].split('|');
        paramValues.push(paramValue);
        //get all unique values and order them asc
        paramValues = Array.from(new Set(paramValues)).sort();
        params[paramKey] = paramValues.join('|');
    }else{
        params[paramKey] = paramValue;
    }

    // We add analytics tracking
    var tracking_label = 'other';
    var device = ($(window).width() < 767 ? 'mobile' : 'desktop');
    if (jQuery.inArray(paramKey, ['Color', 'Cor']) > -1) {
        tracking_label = 'color'
    } else if (jQuery.inArray(paramKey, ['Talle', 'Tamanho', 'Size']) > -1) {
        tracking_label = 'size';
    }
    ga_send_event('products', 'insta-filters-' + device, tracking_label);

    LS.paramsToUrl(params);
};

LS.urlRemoveParam = function(paramKey, paramValue = null) {
    var params = LS.urlParams;
    if(paramValue !== null){
        var paramValues = params[paramKey].split('|');
        if(paramValues.length <= 1){
            return LS.urlRemoveParam(paramKey);
        }
        //get all unique values and order them asc
        paramValues = Array.from(new Set(paramValues)).sort();
        if(paramValues.indexOf(String(paramValue))>-1){
            paramValues.splice(paramValues.indexOf(String(paramValue)), 1);
        }
        params[paramKey] = paramValues.join('|');
        
    }else{
        delete params[paramKey];
    }
    LS.paramsToUrl(params);
};

LS.urlRemoveAllParams = function() {
    LS.paramsToUrl({});
};

LS.paramsToUrl = function(params) {
    var sort_params_array = [];
    for (var key in params) {
        if ($.inArray(key, ['results_only', 'page', 'limit']) == -1) {
            sort_params_array.push(key + '=' + params[key]);
        }
    }
    var sort_params = sort_params_array.join('&');
    if(sort_params.length>0){
        window.location = window.location.pathname + '?' + sort_params;
    }else{
        window.location = window.location.pathname;
    }
};

LS.showFilters = function() {    
    var params = LS.urlParams;
    var container = (LS.theme.code == 'luxury' ? $(".get-filters, .js-append-filters") : $("#get-filters, .js-append-filters"));
    for (var key in params) {        
        if ($.inArray(key, ['results_only', 'page', 'sort_by', 'limit']) == -1) {
            container.show();
            if(params[key].includes('|')){
                params[key].split('|').forEach(variant_value => {
                    container.append('<button type="button" class="filter-remove" onclick="LS.urlRemoveParam(\''+key+'\', \''+variant_value+'\');">' + key + ' - ' + variant_value + '</button>');
                });
            }else{
                container.append('<button type="button" class="filter-remove" onclick="LS.urlRemoveParam(\''+key+'\');">' + key + ' - ' + params[key] + '</button>');
            }
        }
    }    
};

LS.showWhiteListedFilters = function(params) {
    var filters = JSON.parse(params.replace(/&quot;/g,'"'));
    var container = (LS.theme.code == 'luxury' || LS.theme.code == 'summer' ? $(".get-filters, .js-append-filters") : $("#get-filters, .js-append-filters"));
    for (var key in filters) {
        container.show();
        if(Array.isArray(filters[key])){
            filters[key].forEach(variant_value => {
                container.append('<button type="button" class="filter-remove" onclick="LS.urlRemoveParam(\''+key+'\', \''+variant_value+'\');">' + key + ' - ' + variant_value + '</button>');
            });
        }else{
            container.append('<button type="button" class="filter-remove" onclick="LS.urlRemoveParam(\''+key+'\');">' + key + ' - ' + filters[key] + '</button>');
        }
        jQuery(".js-visible-on-applied-filters").show();
    }
};

LS.newsletterPopup = function(options) {
var defaults = {
        selector: "#newsModal",
        cookie_name: 'newsletter-popup',
        cookie_expiration_days: 15,
        mobile_max_pixels: 767,
        timeout: 6000
    };
var opts = $.extend({}, defaults, options);
var newsModal = $(opts.selector);
if($(window).width() > opts.mobile_max_pixels ) {
            var cookie = $.cookie(opts.cookie_name);
            if (cookie != null && typeof cookie !== "undefined") {
                // Cookie is set
                newsModal.modal('hide');
            } else {
                setTimeout(function() {
                    newsModal.modal('show');
                }, opts.timeout);
                // Cookie is not set, so we add it
                $.cookie(opts.cookie_name, 1, { expires: opts.cookie_expiration_days });
            }
        }
        $(window).resize(function() {
            if($(window).width() < opts.mobile_max_pixels ) {
                newsModal.modal('hide');
            }
        });
};

// Home popup function without Bootstrap dependencies 

LS.homePopup = function(options, callback_hide, callback_show) {
var defaults = {
        selector: "#newsModal",
        cookie_name: 'newsletter-popup',
        cookie_expiration_days: 15,
        mobile_max_pixels: 767,
        timeout: 6000
    };
var opts = $.extend({}, defaults, options);
var newsModal = $(opts.selector);
if($(window).width() > opts.mobile_max_pixels ) {
            var cookie = $.cookie(opts.cookie_name);
            if (cookie != null && typeof cookie !== "undefined") {
                // Cookie is set
                if (callback_hide){
                    callback_hide();
                }
            } else {
                setTimeout(function() {
                    if (callback_show){
                        callback_show();
                    }
                }, opts.timeout);
                // Cookie is not set, so we add it
                $.cookie(opts.cookie_name, 1, { expires: opts.cookie_expiration_days });
            }
        }
        $(window).resize(function() {
            if($(window).width() < opts.mobile_max_pixels ) {
                if (callback_hide){
                    callback_hide();
                }
            }
        });
};

/* ---//// Instafilters Mobile\\\\--- */
LS.instaFilterMobile = function( config_override ) {
    var config = {
        trigger_close_selector : '.mob-filter-trigger',
        container_selector : '#mobFilterMenu',
        open_class : 'open',
        bodyscroll_class : 'no-scroll'
    };
    $.extend( config, config_override );
    $( config.trigger_close_selector ).click(function(){
       toggleMenu();
    });

    function toggleMenu() {
        if ($( config.container_selector ).hasClass( config.open_class )) {
            $( config.container_selector ).removeClass( config.open_class );
            $( 'body' ).removeClass( config.bodyscroll_class )
        } else {
            $( config.container_selector ).addClass( config.open_class );
            $( 'body' ).addClass( config.bodyscroll_class )
        }
    }

    $( '.filter-by-sort' ).click(function() {
        if ($('.sort-by').hasClass( 'active' )) {
            $('.sort-by').removeClass( 'active' );
        } else {
            $('.sort-by').addClass( 'active' );
        }
    });

    $(document).keyup(function(e) {
        if (e.keyCode == 27) {
            if ($( config.container_selector ).hasClass( config.open_class )) {
                toggleMenu();
            }
        }
    });
    $( window ).resize(function() {
        $( config.container_selector ).removeClass( config.open_class );
    });

};

LS.search = function($input, callback, custom_configs){
    var defaults = {
        limit : 6,
        snipplet : 'search-results.tpl'
    };
    var config = $.extend({}, defaults, custom_configs);

    var doAjax = function($input, callback) {
        $.ajax({
            method: "GET",
            url: '/search/',
            data: {
                q: $input.val(),
                limit: config.limit,
                snipplet: config.snipplet
            }
        })
        .done(function (response) {
            if (response.html){
                callback.call($input, response.html, response.count);
            }
        });
    };

    var timer;
    $input.keyup(function(){
        var $this = $(this);
        if($this.val().length > 0){
            clearTimeout(timer);
            timer = setTimeout(function() {
                doAjax($this, callback);
            }, 500);
        }
    });
};

//Mobile Zoom Events using SmartZoom plugin

//Open Mobile Zoom
LS.openMobileZoom = function(){
    $("body").addClass("overflow-none full-width p-fixed");
    var $product_image_container = $(".js-open-mobile-zoom").closest(".js-product-image-container");
    var $product_active_image = $product_image_container.find(".js-product-active-image img");
    $product_active_image.clone().appendTo(".js-mobile-zoomed-image").removeClass().removeAttr("style").addClass("js-mobile-zoomable-image");
    $(".js-mobile-zoomed-image img").css("visibility" , "hidden");
    var zoom_url = $product_image_container.find(".js-product-active-image").data("zoom-url")
    if(zoom_url){
        $(".js-mobile-zoomed-image").find("img").attr("src",zoom_url);
    }
    $(".js-mobile-zoom-panel").show();
    $(".js-mobile-zoom-spinner").show();
    setTimeout(function() { 
        $(".js-mobile-zoom-spinner").hide();
        $('.js-mobile-zoomable-image').smartZoom();
        $(".js-mobile-zoomed-image img").css("visibility" , "visible");
    }, 300);
};

//Close Mobile Zoom
LS.closeMobileZoom = function(offset_top){
    $("body").removeClass("overflow-none full-width p-fixed").removeAttr('style');
    $(".js-mobile-zoomed-image").css("visibility" , "hidden");
    $(".js-mobile-zoomed-image").empty();
    $(".js-mobile-zoom-panel").hide();
    $(window).scrollTop($('.js-product-image-container').offset().top - offset_top);
};

// Mobile pagination
LS.paginateMobile = function(){
    var paginator_input_val = $(".js-mobile-paginator-input").val();
    var $page_to_go_link = $(".js-page-link-"+paginator_input_val);
    if($page_to_go_link.length){
        $page_to_go_link[0].click();
    }
};

// For closing
LS.shouldShowOrderStatusNotification = function(url){
    return !localStorage.getItem('statuspage:hide:' + url);
};

LS.dontShowOrderStatusNotificationAgain = function(url){
    localStorage.setItem('statuspage:hide:' + url, true);
};

// Progress Bar for Free Shipping - (Used by theme Amazonas)
LS.freeShippingProgress = function(updateOnPageLoad) {

    // Obtaining data to perform the calculation

    if(updateOnPageLoad){
        var cart_subtotal = $(".js-cart-subtotal").data('priceraw');
    }else{
        var cart_subtotal = LS.data.cart.subtotal;
    }
    
    var free_shipping_min = $(".js-ship-free-min").data('pricemin');
    if($("#single-product").length){
        var free_shipping_product_price = $("#single-product .js-price-display").data('product-price');
    }
    
    // Threshold to show what is missing for free shipping
    var free_shipping_umbral = cart_subtotal * 0.50;

    // Progress bar calculation
    var free_shipping_rest = free_shipping_min - cart_subtotal;
    let free_shipping_rest_total = free_shipping_rest / 100;
    var free_shipping_bar_active = (cart_subtotal * 100)/free_shipping_min;

    if($("#single-product").length){
        // Calculate if adding one more product free shipping is achieved
        var free_shipping_product_rest = free_shipping_min - (cart_subtotal + free_shipping_product_price);
        if (free_shipping_product_rest <= 0 ) {
            $(".js-shipping-add-product-label").show();
            $(".js-shipping-calculator-label").hide();
            $(".js-free-shipping-add-product-title").addClass("transition-up-active");
            $(".js-free-shipping-title-min-cost").removeClass("transition-up-active");
        } else {
            $(".js-shipping-add-product-label").hide();
            $(".js-shipping-calculator-label").show();
            $(".js-free-shipping-add-product-title").removeClass("transition-up-active");
            $(".js-free-shipping-title-min-cost").addClass("transition-up-active");
        }
    }

    if (free_shipping_rest <= 0 ) {
        $('.js-bar-progress-active').width(100 + '%');
        $('.js-ship-free-rest-message').removeClass('condition amount');
        $('.js-ship-free-rest-message').addClass('success');
        $('.js-bar-progress-check').addClass('active');
        $(".js-free-shipping-add-product-title").removeClass("transition-up-active");
        $(".js-shipping-add-product-label").hide();
    } else  if (free_shipping_rest > free_shipping_umbral ) {
        $('.js-bar-progress-active').width(free_shipping_bar_active + '%');
        $('.js-ship-free-rest-message').removeClass('success amount');
        $('.js-ship-free-rest-message').addClass('condition');
        $('.js-bar-progress-check').removeClass('active');
    } else if (free_shipping_rest <= free_shipping_umbral ) {
        $('.js-ship-free-dif').html(LS.formatToCurrency(free_shipping_rest_total));
        $('.js-bar-progress-active').width(free_shipping_bar_active + '%');
        $('.js-ship-free-rest-message').removeClass('condition success');
        $('.js-ship-free-rest-message').addClass('amount');
        $('.js-bar-progress-check').removeClass('active');
    }   
}

LS.freeShippingLabelUpdate = function(free_shipping, calculateShippingOnProduct) {

    if (free_shipping && free_shipping.cart_has_free_shipping) {
        jQuery('.js-free-shipping-message').show();
        jQuery('.js-shipping-calculator-label, .js-shipping-add-product-label').hide();
        jQuery('.js-shipping-calculator-label-default').hide();
        
        // Used for stores that hides calculator after calculating
        $(".js-free-shipping-title").addClass("transition-up-active");
        $(".js-free-shipping-title-min-cost, .js-free-shipping-add-product-title").removeClass("transition-up-active");

        // Update shipping on product detail only if free shipping is achieved to avoid inconsistencies. Used on product ajax add to cart event
        if(calculateShippingOnProduct){
            if(!$(".js-cart-total").hasClass("js-free-shipping-achieved")){
                LS.updateShippingProduct();
            }
        }

        $(".js-cart-total").addClass("js-free-shipping-achieved");

    } else if (free_shipping && free_shipping.min_price_free_shipping) {
        jQuery('.js-free-shipping-message').hide();
        jQuery('.js-shipping-calculator-label-default').hide();
        jQuery('.js-shipping-calculator-label').show();

        // Used for stores that hides calculator after calculating
        $(".js-free-shipping-title").removeClass("transition-up-active");
        $(".js-free-shipping-title-min-cost").addClass("transition-up-active");
        $(".js-cart-total").removeClass("js-free-shipping-achieved");
    } else {
        jQuery('.js-free-shipping-message').hide();
        jQuery('.js-shipping-calculator-label').hide();
        jQuery('.js-shipping-calculator-label-default').show();
    }
    //** Used by theme Amazonas with Tag: insight-fs-progress
    if ($(".js-ship-free-rest").length) { 
        LS.freeShippingProgress();
    }

};


/**
 * Wait for jQuery and "resolve the LS.ready promise".
 *
 * It's not a true promise, so instead we call the queued up callbacks and replace LS.ready.then with the "apply function" function.
 * Using a closure to avoid polluting the LS namespace with the waitForJquery function
 */
(function(LS){
    function waitForJquery(callback){
        if (typeof $ === "undefined"){
            setTimeout(waitForJquery, 100, callback);
            return;
        }

        callback.call(undefined, $);
    }

    waitForJquery(function($){
        LS.ready = {
            then: function(callback){
                callback.call(undefined, LS);
            }
        };
        LS._readyCallbacks = LS._readyCallbacks || [];
        LS._readyCallbacks.forEach(LS.ready.then);

        $(document).ready(function(){
            LS.setup();
        });
    });
})(LS);
