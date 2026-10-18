Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()
$blogForm=New-Object System.Windows.Forms.Form
$blogForm.Text='设置 MrRubbish 博客管理员'
$blogForm.ClientSize=New-Object System.Drawing.Size(470,390)
$blogForm.StartPosition='CenterScreen'
$blogForm.FormBorderStyle='FixedDialog'
$blogForm.MaximizeBox=$false
$blogForm.MinimizeBox=$false
$blogForm.TopMost=$true
$blogForm.Font=New-Object System.Drawing.Font('Microsoft YaHei UI',10)
function Add-BlogLabel([string]$text,[int]$top,[int]$height=24){
    $label=New-Object System.Windows.Forms.Label
    $label.Text=$text
    $label.Location=New-Object System.Drawing.Point(28,$top)
    $label.Size=New-Object System.Drawing.Size(414,$height)
    $blogForm.Controls.Add($label)
    return $label
}
$null=Add-BlogLabel '密码仅在本机处理，不会发送到聊天。' 18
$null=Add-BlogLabel '保存后由程序把密码哈希同步到正式博客。' 43
$null=Add-BlogLabel '管理员账号（字母、数字或 ._-）' 82
$blogUsername=New-Object System.Windows.Forms.TextBox
$blogUsername.Text='admin';$blogUsername.Location=New-Object System.Drawing.Point(28,108);$blogUsername.Size=New-Object System.Drawing.Size(414,28)
$blogForm.Controls.Add($blogUsername)
$null=Add-BlogLabel '管理员密码（至少 12 位）' 147
$blogPassword=New-Object System.Windows.Forms.TextBox
$blogPassword.UseSystemPasswordChar=$true;$blogPassword.MaxLength=128
$blogPassword.Location=New-Object System.Drawing.Point(28,173);$blogPassword.Size=New-Object System.Drawing.Size(414,28)
$blogForm.Controls.Add($blogPassword)
$null=Add-BlogLabel '再次输入密码' 212
$blogConfirm=New-Object System.Windows.Forms.TextBox
$blogConfirm.UseSystemPasswordChar=$true;$blogConfirm.MaxLength=128
$blogConfirm.Location=New-Object System.Drawing.Point(28,238);$blogConfirm.Size=New-Object System.Drawing.Size(414,28)
$blogForm.Controls.Add($blogConfirm)
$blogStatus=Add-BlogLabel '' 277 42
$blogStatus.ForeColor=[System.Drawing.Color]::Firebrick
$blogSave=New-Object System.Windows.Forms.Button
$blogSave.Text='保存管理员设置';$blogSave.Location=New-Object System.Drawing.Point(263,333);$blogSave.Size=New-Object System.Drawing.Size(179,36)
$blogForm.Controls.Add($blogSave);$blogForm.AcceptButton=$blogSave
$blogSave.Add_Click({
    if($blogUsername.Text -notmatch '^[a-zA-Z0-9._-]{3,40}$'){$blogStatus.Text='账号请用 3–40 位字母、数字或 ._-。';return}
    if($blogPassword.Text.Length -lt 12){$blogStatus.Text='密码至少需要 12 位。';return}
    if($blogPassword.Text -cne $blogConfirm.Text){$blogStatus.Text='两次密码不一致，请重新输入。';return}
    if($blogPassword.Text -ceq 'LocalOnly-Change-Me-2026!'){$blogStatus.Text='请设置你自己的密码。';return}
    try{
        $blogSave.Enabled=$false
        $blogSalt=New-Object byte[] 16
        $blogRng=[System.Security.Cryptography.RandomNumberGenerator]::Create();$blogRng.GetBytes($blogSalt);$blogRng.Dispose()
        $blogDerive=New-Object System.Security.Cryptography.Rfc2898DeriveBytes($blogPassword.Text,$blogSalt,100000,[System.Security.Cryptography.HashAlgorithmName]::SHA256)
        $blogDigest=$blogDerive.GetBytes(32);$blogDerive.Dispose()
        $blogSaltHex=[System.BitConverter]::ToString($blogSalt).Replace('-','').ToLowerInvariant()
        $blogDigestHex=[System.BitConverter]::ToString($blogDigest).Replace('-','').ToLowerInvariant()
        $blogHash='pbkdf2-sha256$100000$'+$blogSaltHex+'$'+$blogDigestHex
        $blogContent='ADMIN_USERNAME='+($blogUsername.Text|ConvertTo-Json -Compress)+[Environment]::NewLine+'ADMIN_PASSWORD_HASH='+($blogHash|ConvertTo-Json -Compress)+[Environment]::NewLine+'BLOG_CREDENTIAL_MODE="owner"'+[Environment]::NewLine
        $blogTarget=[System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\.dev.vars'))
        [System.IO.File]::WriteAllText($blogTarget,$blogContent,(New-Object System.Text.UTF8Encoding($false)))
        $blogPassword.Clear();$blogConfirm.Clear()
        [System.Console]::WriteLine('Owner credential hash configured. No password value logged.')
        $null=[System.Windows.Forms.MessageBox]::Show($blogForm,'管理员设置已保存。回到 Codex 后即可继续发布。','保存成功',[System.Windows.Forms.MessageBoxButtons]::OK,[System.Windows.Forms.MessageBoxIcon]::Information)
        $blogForm.DialogResult=[System.Windows.Forms.DialogResult]::OK
        $blogForm.Close()
    }catch{$blogStatus.Text='保存失败：'+$_.Exception.Message;$blogSave.Enabled=$true}
})
$blogForm.Add_Shown({[System.Console]::WriteLine('Windows administrator setup window is ready.');$blogForm.Activate();$blogUsername.Focus()})
$blogResult=$blogForm.ShowDialog()
$blogForm.Dispose()
if($blogResult -ne [System.Windows.Forms.DialogResult]::OK){exit 2}
