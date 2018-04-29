
<?php
// kodlar buraya gelecek
$sayfaNo   = $DBH->real_escape_string( $_POST['sayfaNo'] );
$tableName = '';
$gidenVeri = [];
$tumVeri   = [];

$sayfaBasiKayit = 10;
$basKayit       = ( $sayfaNo - 1 ) * $sayfaBasiKayit;



if ( $sayfaNo == 1 ) {
	$baslamaKaydiNo = 0;
} else {
	$baslamaKaydiNo = ( $sayfaNo - 1 ) * $sayfaBasiKayit;
}
$ekSQL = ''; // gelen ek sorgu kriterleri varsa burada ekSQL e dönüştürülecek ve WHERE kısmında yer alacak

$SQLi = 'SELECT * FROM '.$tableName;
$SQLi .= " " . $ekSQL;
//--
$satirTumVeri['satirVeri']   = '';
$satirTumVeri['satirEkVeri'] = '';
$ekVeriTablo                 = '';
$limitliKriterliSorgu        = $db->query( $SQLi . ' LIMIT ' . $basKayit . ',' . $sayfaBasiKayit );
$kiterliSorgu                = $db->query( $SQLi );
$kacKayitVar                 = $kiterliSorgu->rowCount();
while ( $oKayit = $limitliKriterliSorgu->fetch( PDO::FETCH_ASSOC ) ) {
	$satirVeri   = [];
	$satirVeri[] = '';
	$satirVeri[] = $oKayit[''];

	$satirTumVeri['satirVeri']   = $satirVeri;
	$satirTumVeri['satirEkVeri'] = $ekVeriTablo;
	$tumVeri[]                   = $satirTumVeri;
}

$gidenVeri['durum']       = 'OK';
$gidenVeri['sayfaNo']     = $sayfaNo;
$gidenVeri['kayitSayisi'] = $kacKayitVar;
$bitKayit                 = ( $sayfaNo * $sayfaBasiKayit <= $kacKayitVar ) ? ( $sayfaNo * $sayfaBasiKayit ) : $kacKayitVar;
$gidenVeri['bitKayit']    = $bitKayit;
$gidenVeri['basKayit']    = $basKayit + 1;
$sayfaAtigi               = $kacKayitVar % $sayfaBasiKayit;
$sayfalamaMaxSayfa        = ( $sayfaAtigi > 0 ) ? round( ( $kacKayitVar + ( $sayfaBasiKayit - $sayfaAtigi ) ) / $sayfaBasiKayit ) : ( $kacKayitVar / $sayfaBasiKayit );
$gidenVeri['sayfaSayisi'] = ( $sayfalamaMaxSayfa == 0 ) ? 1 : $sayfalamaMaxSayfa;
$gidenVeri['tabloVerisi'] = json_encode( $tumVeri );
echo( json_encode( $gidenVeri ) );

