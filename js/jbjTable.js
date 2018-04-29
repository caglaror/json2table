//
function bicimleJSON2tablo(tabloID, sayfalamaEklensinMi, sayfalamaKonum, hangiSayfa, sorgulanacakSayfa, sorguParametreleri, ekVeriYuklensinMi, sonFonksiyon, sonFonksiyonParametreleri, basFonksiyon, basFonksiyonParametreleri) {
    // bootstrap ve jquery kullanır!
    // tabloID verilerin yerleştirileceği tabloyu temsil eder
    // sayfalamaEklensinMi boolean degeri tablonun en altında sayfalama eklenip eklenmeyeceğini sorar
    // sayfalamaKonum: 'Y' yukarıya, 'A' aşağıya sayfalamayı konumlandırır. Yukarıya tablonun üstüne div koyara, aşağıya ise tabloya ek satır ekleyerek yapar.
    // hangiSayfa: kaçıncı sayfaya gösterilecek bunu belirler
    // sorgulanacakSayfa: ajax sorgusunun yönlendireceği ve aşağıdaki parametrelerin bekleneceği sayfanın adresi
    // sorguPArametreleri: filtre amaçlı kullanılacak parametreler {} içerisinde gönderiliyor. Nesne olarak taşınıyor ve kullanılıyor.
    // ekVeriYuklensinMi: her satırın altında o satırın temsil ettiği verinin detay bilgisi verilebilir, verilmek isteniyorsa true yapılır ve sunucudan beklenen verilere eklenir
    // gelenVeri içerisindeki özellikler ve veri tipleri şöyle
    // tabloVerisi JSON tipinde, satır satır array şeklinde ve satırlarda dizi tipinde hücrelerin verileri olacak.
    // gelen json tipindeki veride olması gereken alanlar
    /*   SUNUCUDAN DÖNMESİ GEREKEN JSON elementleri
    durum : durum değeri genel kontrol amaçlı 'OK' olursa herşey yolunda demektir. Farklı mesajlar özel olarak değerlendirilir
    tabloVerisi : iki boyutlu bir dizi birinci seviye satırlar ikinci seviye hücreler
    sayfalamaVarMi : boolean tipinde true veya false
    sayfaSayisi : sayfalama yapılıyorsa
    kayitSayisi : toplam bulunan kaç kayit olduğunu bildiren sayı int tipinde
    basKayit : görüntülenmesi için gönderilen kayıtların ilkinin sıra nosu
    bitKayit: görüntülenmesi için gönderilen kayıtların sonuncusunun sıra nosu
    sayfaNo : sunucudan hangi sayfanın gönderildiği int tipinde (ŞART DEĞİLDİR)
    Sunucu Tarafı Notu: Tablo verisi hazırlanırken satır verisi iki ana özellikte toplanıp derlenecek (Örnek: yurtdisiDenetimOnhazirlik_action.php içinde
    $satirVeri=[];
    $satirVeri[]='ilk hücreye yazdırılmak istenen değer....';
    sonra bu veriler toplanıp
    $satirTumVeri değerleri de
    $tumVeri dizisine eklenecek, aşağıdaki gibi
     $satirTumVeri['satirVeri']=$satirVeri;
     $satirTumVeri['satirEkVeri']=$ekVeriTablo;
     $tumVeri[]=$satirTumVeri;

     $satirTumVeri['satirVeri']='';  sonrasında
     $satirTumVeri['satirEkVeri']='';
     // js nesnesinden kullanımları
                        .satirVeri;
                        .satirEkVeri;


    en son $gidenVeri['durum]= şeklinde tüm istenen değerler de gidenVeri içerisine atılıp
     exit(json_encode($gidenVeri)); ile clienta gönderilecek



       İçi dolduralacak tabloda thead bölümündeki satırda yer alan th hücreleri sayısı ile aşağıdaki json içerisinde yer alan satırVeri içindeki element sayısı eşit olmalı. Yoksa tabloda kaymalar olur.
       Aşağıda sunucudan dönmesi beklenen json_encode edilmiş veriler görünüyor. $.post ile gönderilen ajax çağrısına cevaben beklenen response bu formatta olmalı
     {"durum":"OK","sayfaNo":"1","kayitSayisi":1,"bitKayit":1,"basKayit":1,"sayfaSayisi":1,"tabloVerisi":"[{\"satirVeri\":[1454,\"Dacia Duster Ambiance\",\"06ABC06\"],\"satirEkVeri\":\"Herhangi bir veri yok\"}]"}
    * */

    // tanimlamalar
    var gelenJSONverisi;
    var sayfalamaParametreleri;
    var tabloVerisi;
    var gelenVeri;
    var satirSayisi;
    var oSatir;
    var hucreSayisi;
    var str;
    var hcr;
    var toplamKolonSayisi;
    var bilgiSatiri;
    var kayitSayisi;
    var sayfaSayisi;
    var basKayit;
    var bitKayit;
    var oSayfa;
    var currentTarget;
    var pages;
    //


    //
    // sunucudan veri talebi
    // önce sayfa nosunu sorguParametrelerine ekliyoruz.

    sorguParametreleri.sayfaNo=hangiSayfa;
    if(typeof basFonksiyon == 'function'){basFonksiyon(basFonksiyonParametreleri);}
    $.post(
        sorgulanacakSayfa,
        sorguParametreleri,
        function(data){
            var satirVeri;
            var satirEkVeri;
            // -----------  Şimdi gelen veriyle tablo yerleştirme ve sayfalama işlemleri yapılacak
            gelenVeri = JSON.parse(data);
            // tablonun içini doldurma
            if(gelenVeri.tabloVerisi==null){
                // tabloVerisi null geldiyse
                gelenVeri.tabloVerisi=[];
            }
            tabloVerisi = JSON.parse(gelenVeri.tabloVerisi); // tabloVerisi boş gelirse ne yapılacak, null gelince hata veriyor fonksiyon

            satirSayisi = tabloVerisi.length;

            $('#'+tabloID+' > tbody').html('');

            if(Boolean(ekVeriYuklensinMi) && $('#'+tabloID+' > thead').data('tHeadGuncelmi')!==true){ // ek veri yüklenecekse temsili kolon ekleniyor
                $('#'+tabloID+' > thead').data('tHeadGuncelmi',true);
                $('#'+tabloID+' > thead').find('tr:first').prepend('<th class="ortayaHizalaYapistir"><span class="icon-eye-close curPointer" title="Hepsini kapat" id="'+tabloID+'_kapatici"></span><span class="icon-eye-open curPointer" title="Hepsini aç" id="'+tabloID+'_acici"></span></th>');

                $('#'+tabloID+'_acici').on('click',function(){ // ilk satırdaki header içindeki tüm gözleri temsil eden ve tıklandığında hepsine işlem yapan göz ikonları
                    $('#'+tabloID+' > tbody').find('.icon-eye-open').click();
                })
                $('#'+tabloID+'_kapatici').on('click',function(){
                    $('#'+tabloID+' > tbody').find('.icon-eye-close').click();
                })
            }


            str=0;
            for (str = 0; str < satirSayisi; str++) {

                oSatir = tabloVerisi[str];

                $('#'+tabloID+' > tbody').append('<tr id="satir_'+str+'"></tr>');
                satirVeri=[];
                satirEkVeri='';
                satirVeri = oSatir.satirVeri;
                satirEkVeri = oSatir.satirEkVeri;
                //
                // satıra ek veri data() ile ekleniyor, eklenen veri tabloyu düzenleyen (bu fonksiyonu çağıran fonksiyon) fonksiyon ele alacak
                $('#satir_'+str).data('satirEkVerisi',satirEkVeri);

                //                        //

                // Eğer ekSatirVerisi isteniyorsa tablonun en soluna bir sütun daha eklenecek
                if(Boolean(ekVeriYuklensinMi)){
                    $('#'+tabloID+' > tbody').find('tr:last').append('<td class="ortayaHizalaYapistir"><span class="icon-eye-open" title="Detayı göster" id="acKapa_'+str+'" style="cursor:pointer"></span></td>'); // sonuncu satıra ilk hücreyi ekledik
//console.log('ilk hücreye göz yerleştirdik. Şimdi fonksiyon atayacağız tıklanma eventına.');
                    // ilk eklenen o hücreye bilgi satırını açıp kapama olayını bağlayacağız
                    $('#'+tabloID+' > tbody #satir_'+str).on('click','#acKapa_'+str, function(){
                        console.log('Hedeflenmiş element id: '+this.id);
                        var bST = this.id;
                        if(nY(bST).className=='icon-eye-close'){
                            console.log('Kapalıymış, şimdi açılması gerek');
                            nY(bST).className='icon-eye-open';
                            $(this).closest('tr').next().css('display','none');
                        }
                        else{
                            console.log('Açıkmış, şimdi kapanması gerek');
                            nY(this.id).className='icon-eye-close';
                            //$(this).closest('tr').next().toggle();
                            $(this).closest('tr').next().css('display','table-row');
                        }


                    });
                }
                //
                //
                hucreSayisi = satirVeri.length;
                for(hcr=0; hcr<hucreSayisi; hcr++){
                    $('#'+tabloID+' > tbody').find('tr:last').append('<td>'+satirVeri[hcr]+'</td>');
                }
                toplamKolonSayisi = (parseInt(hcr)).toString();
                // şimdi ek veri için istendiyse bir boş satır ekleyip içine ek veriyi koyacağız
                if(Boolean(ekVeriYuklensinMi)){
                    toplamKolonSayisi = (parseInt(hcr)+1).toString();
                    $('#'+tabloID+' > tbody').append('<tr style="display:none;" id="satir_ekVeri_'+str+'"><td colspan="'+ toplamKolonSayisi +'">'+satirEkVeri+'</td></tr>');
                }


            }


            if(sayfalamaEklensinMi){
                kayitSayisi = gelenVeri.kayitSayisi;
                basKayit = gelenVeri.basKayit;
                bitKayit = gelenVeri.bitKayit;
                sayfaSayisi = gelenVeri.sayfaSayisi;

                bilgiSatiri='Bulunan toplam <span id="toplKayit" class="badge badge-inverse beyazYaz">'+kayitSayisi+'</span>';
                bilgiSatiri+=' sonuçtan, <span id="basKayit" class="badge badge-info beyazYaz">'+basKayit+'</span>';
                bilgiSatiri+=' ile <span id="bitKayit" class="badge badge-info beyazYaz">'+bitKayit+'</span> arası gösteriliyor.';
                if(!$.isNumeric(toplamKolonSayisi)){
                    toplamKolonSayisi=$('#'+tabloID+' > thead').find('> tr:first > th').length;
                    $('#'+tabloID+' > tbody').append('<tr><td colspan="'+toplamKolonSayisi+'">Bu filtrelemeye göre hiç bir kayıt bulunamadı</td></tr>');
                }
                $('#'+tabloID+' > tbody').append('<tr><td colspan="'+toplamKolonSayisi+'">'+bilgiSatiri+'</td></tr>');

// son fonksiyona parametre olarak gönderilebilecek veriler


                if(sonFonksiyonParametreleri && sonFonksiyonParametreleri.sayfaSayisi==undefined){
                    sonFonksiyonParametreleri['sayfaSayisi']=gelenVeri.sayfaSayisi;
                    sonFonksiyonParametreleri['kayitSayisi']=gelenVeri.kayitSayisi;
                }

                // sayfalama
                oSayfa = hangiSayfa?hangiSayfa:1;
                sayfalamaParametreleri = {
                    currentPage: oSayfa,
                    alignment:'right',
                    useBootstrapTooltip:true,
                    size:'small',
                    totalPages: sayfaSayisi,
                    onPageClicked: function(e,originalEvent,type,page){
                        e.stopImmediatePropagation();
                        currentTarget = $(e.currentTarget);
                        pages = currentTarget.bootstrapPaginator("getPages");
                        bicimleJSON2tablo(tabloID, sayfalamaEklensinMi, sayfalamaKonum, page, sorgulanacakSayfa, sorguParametreleri, ekVeriYuklensinMi, sonFonksiyon,sonFonksiyonParametreleri, basFonksiyon, basFonksiyonParametreleri);
                    },
                    onPageChanged: function(e,oldPage,newPage){
                        //console.log("Eski sayfa: "+oldPage+" yenisayfa: "+newPage);
                        //newPage ile alıp paginatorAktifSayfa değişkenine atıyoruz. Bu değişken kullanılan sayfanın jssi içinde tanımlanmalı. Default olarak bir yere koymadık. ilgili js dosyasında en üstlerde
                        // var paginatorAktifSayfa=1; // şeklinde tanımlanmalı ki içi değer ile doldurulabilsin.
                        paginatorAktifSayfa = newPage;
                    }
                }
                //
                if(!$('#'+tabloID+'_sayfalamaTasiyici').length){
                    switch(sayfalamaKonum){
                        case "Y":
                            // Sayfalama yukarıda olsun isteniyorsa
                            $('#'+tabloID).before('<div id="' + tabloID + '_sayfalamaTasiyici">...</div>');
                            break;
                        case "A":
                            // Sayfalama aşağıda olsun isteniyorsa
                            $('#'+tabloID+' > tbody').append('<tr><td colspan="'+toplamKolonSayisi+'"><div id="' + tabloID + '_sayfalamaTasiyici">...</div></td></tr>');
                            break;

                    }
                    $('#'+tabloID+'_sayfalamaTasiyici').css({marginTop:'0px', marginBottom:'0px'});
                }
                $('#'+tabloID+'_sayfalamaTasiyici').bootstrapPaginator(sayfalamaParametreleri);


            }
            //------------
            if(typeof sonFonksiyon == 'function'){sonFonksiyon(sonFonksiyonParametreleri);}
            str=0;
        }
    );

}


