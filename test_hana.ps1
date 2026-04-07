$ErrorActionPreference = "Stop"
Add-Type -Path "c:\mikne\PortalHormiga\Dispersion\PortalGovi\bin\Release\netcoreapp3.1\Sap.Data.Hana.Core.v2.1.dll"
$conn = New-Object Sap.Data.Hana.HanaConnection("Server=192.168.0.232:30015;UserID=SYSTEM;Password=Shosa2018-")
$conn.Open()

# First attempt to add the column, catch if it already exists
try {
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "ALTER TABLE MIKNE.COTIZACION_ENCABEZADO ADD (FOLIOSAP_STR NVARCHAR(100))"
    $cmd.ExecuteNonQuery()
    Write-Host "Column FOLIOSAP_STR successfully added."
} catch {
    Write-Host ("Error or column already exists: " + $_.Exception.Message)
}
$conn.Close()
