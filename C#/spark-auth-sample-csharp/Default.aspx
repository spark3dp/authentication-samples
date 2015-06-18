<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="spark_auth_sample_csharp.Default" %>


<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title>Spark Sample Application - Authentication</title>
    <meta charset="utf-8" />
    <!-- fonts -->
    <link href='//fonts.googleapis.com/css?family=Open+Sans:300,600,400' rel='stylesheet' type='text/css' />
    <!-- Bootstrap core CSS -->
    <link href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css" rel="stylesheet" />
    <link href="style.css" rel="stylesheet" type="text/css" />
</head>
<body>
    <form id="form1" runat="server">
         <div class="container">
        <div class="col-md-12">
            <div id="welcome-wrapper">
                <h2>Welcome to <br/>Spark C# Authentication Sample App</h2>

                <p>To try the sample, you need to login with a test environment account.</p>

                <div class="col-md-12">
                    <p class="token-wrapper">Guest Token:
                        <asp:Label id="lblGuestToken" runat="server"></asp:Label>
                    </p>

                    <p class="token-wrapper">
                        Access Token:
                        <asp:Label id="lblAccessToken" runat="server"></asp:Label>
                    </p>

                    <p class="token-wrapper">Refresh Token:
                        <asp:Label id="lblRefreshToken" runat="server"></asp:Label>
                    </p>

                    <asp:Button ID="btnLogin" runat="server" Text="Login to get an access token" OnClick="btnLogin_Click" CssClass="spark_btn primary"/>
                    <asp:Button ID="btnLogout" runat="server" Text="Logout" OnClick="btnLogout_Click" CssClass="spark_btn primary"/>
                    <asp:Button ID="btnRefreshToken" runat="server" Text="Refresh access token" OnClick="btnRefreshToken_Click" CssClass="spark_btn"/>
                    <asp:Button ID="btnGuestToken" runat="server" Text="Get Guest Token" OnClick="btnGuestToken_Click" CssClass="spark_btn"/>
                </div>

            </div>
        </div>

    </div>
     
    </form>
</body>
</html>