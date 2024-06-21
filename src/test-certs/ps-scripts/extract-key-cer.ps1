param (
    [Parameter(Mandatory=$true)]
    [string]$pfxFilePath,

    [Parameter(Mandatory=$true)]
    [string]$password,

    [Parameter(Mandatory=$true)]
    [string]$outputDirectory
)
if(!(Test-Path -Path $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory
}

$keyFilePath = Join-Path -Path $outputDirectory -ChildPath "key.pem"
$certFilePath = Join-Path -Path $outputDirectory -ChildPath "cert.pem"
$decryptedKeyFilePath = Join-Path -Path $outputDirectory -ChildPath "decrypted-key.pem"

& openssl pkcs12 -in $pfxFilePath -nocerts -out $keyFilePath -password pass:$password -nodes

& openssl pkcs12 -in $pfxFilePath -clcerts -nokeys -out $certFilePath -password pass:$password

& openssl rsa -in $keyFilePath -out $decryptedKeyFilePath

Write-Output "Certificate save to $certFilePath"
Write-Output "Decrypted key saved to $decryptedKeyFilePath"