
$hostname = "alex.test"
$additionalDnsNames = @("alex.test")

$srcStoreScope = "LocalMachine"
$srcStoreName = "My"

$srcStore = New-Object System.Security.Cryptography.X509Certificates.X509Store $srcStoreName, $srcStoreScope
$srcStore.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadOnly)

$cert = $srcStore.certificates -cmatch "CN=$hostname"
if (!$cert) {
    $dnsNames = @($hostname) + $additionalDnsNames
    New-SelfSignedCertificate -Subject $hostname -DnsName $dnsNames -CertStoreLocation "cert:\$srcStoreScope\$srcStoreName" -NotAfter (Get-Date).AddMonths(120) -Provider "Microsoft Enhanced RSA and AES Cryptographic Provider"
    $cert = $srcStore.certificates -cmatch "CN=$hostname"
}

$dstStoreScope = "LocalMachine"
$dstStoreName = "root"

$dstStore = New-Object System.Security.Cryptography.X509Certificates.X509Store $dstStoreName, $dstStoreScope
$dstStore.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
$dstStore.Add($cert[0])

$srcStore.Close()
$dstStore.Close()