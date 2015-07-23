//
//  FirstViewController.m
//  Spark-sdk-demo
//
//  Created by Autodesk on 6/25/15.
//  Copyright (c) 2015 Autodesk. All rights reserved.
//

#import "FirstViewController.h"
#import "SparkSession.h"
#import "Constants.h"
#import "SparkAuthentication.h"
#import "SparkDrive.h"
#import "AccessTokenResponse.h"
#import "MeshImportRequest.h"


@interface FirstViewController ()

@end

@implementation FirstViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    _apiCommnads = [NSArray arrayWithObjects:@"Grant Spark Guest Token",
                    @"Grant Spark Access Token",
                    @"Upload File",
                    @"Mesh Import",
                    @"Mesh Export",
                    @"Mesh Analysis", nil];
    
    _resultText = [NSMutableString string];
    
    [self updateSessionDetails];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)grantSparkGuestTokenPressed {
    
    [[SparkAuthentication sharedInstance] getGuestToken:^(AccessTokenResponse *responseObject) {
        [self updateSessionDetails];
    } failure:^(NSString *error) {
        [self updateResultView:error];
    }];
}

- (void)grantSparkAccessTokenPressed {
    
    [[SparkAuthentication sharedInstance] getAuthorizationCode:^(AccessTokenResponse *responseObject) {
        [self updateSessionDetails];
    } failure:^(NSString *error) {
        [self updateResultView:error];
    } parentViewController:self];
}

-(void)updateSessionDetails{
    SparkSession * currentSession = [SparkSession getActiveSession];
    
    [self updateResultView:[NSString stringWithFormat:@"accessToken: %@", currentSession.accessToken]];
    [self updateResultView:[NSString stringWithFormat:@"refreshToken: %@", currentSession.refreshToken]];
    
    NSString *tokenType = SPARK_TOKEN_TYPE_NONE;
    if (currentSession.authorizationType == SPARK_AUTHORIZATION_TOKEN_TYPE_REGULAR)
    {
        tokenType = SPARK_TOKEN_TYPE_REGULAR;
    }
    else if (currentSession.authorizationType == SPARK_AUTHORIZATION_TOKEN_TYPE_GUEST)
    {
        tokenType = SPARK_TOKEN_TYPE_GUEST;
    }
    
    [self.sessionTokenTypeTextField setText:tokenType];
}

-(void)updateResultView:(NSString*)text{
    [_resultText appendString:[NSString stringWithFormat:@"\n%@\r\n", text]];
    [self.resultTextView setText:_resultText];
    [self scrollOutputToBottom];
}

-(void)scrollOutputToBottom {
    CGPoint p = [self.resultTextView contentOffset];
    [self.resultTextView setContentOffset:p animated:NO];
    [self.resultTextView scrollRangeToVisible:NSMakeRange([self.resultTextView.text length], 0)];
}

-(void)selectFile{
    UIImagePickerController *imagePickerController = [[UIImagePickerController alloc] init];
    imagePickerController.sourceType = UIImagePickerControllerSourceTypePhotoLibrary;
    imagePickerController.delegate = self;
    [self presentViewController:imagePickerController animated:YES completion:nil];
}

-(void)uploadFile{
    NSURL *filePath = [[NSBundle mainBundle] URLForResource:@"TeaPot" withExtension:@"obj"];
    NSString * stringPath = [filePath absoluteString];
    _fileData = [NSData dataWithContentsOfURL:[NSURL URLWithString:stringPath]];
    
    FileRequest * fileRquest = [[FileRequest alloc] initWithFileRequest:NO publicEnable:NO path:nil fileData:_fileData];
    [[SparkDrive sharedInstance] sparkUploadFile:fileRquest succesBlock:^(FileResponse *responseObject) {
        if ([responseObject.files count] > 0) {
            _fileResponse = [responseObject.files objectAtIndex:0];
            [self updateResultView:[[responseObject.files objectAtIndex:0] toString]];
        }else{
            _fileResponse = responseObject;
            [self updateResultView:[responseObject toString]];
        }
    } failure:^(NSString *error) {
        [self updateResultView:error];
    }];
}

-(void)meshImport{
    MeshImportRequest * meshImportRequest = [[MeshImportRequest alloc] initWithFileId:_fileResponse.fileId
                                                                                 name:@"TeaPot"
                                                                            transfrom:@""
                                                                     isGenerateVisual:NO];
    
    [[SparkDrive sharedInstance] sparkMeshImport:meshImportRequest succesBlock:^(NSDictionary *responseObject) {
        NSLog(@"%@", responseObject);
    } failure:^(NSString *error) {
        [self updateResultView:error];
    }];
}

-(void)meshExport{
    [self updateResultView:@"Not implemented"];
}

-(void)meshAnalysis{
    [self updateResultView:@"Not implemented"];
}


// This method is called when an image has been chosen from the library or taken from the camera.
- (void)imagePickerController:(UIImagePickerController *)picker didFinishPickingMediaWithInfo:(NSDictionary *)info
{
    //You can retrieve the actual UIImage
    _selectedFile = [info valueForKey:UIImagePickerControllerOriginalImage];
    _fileData = UIImageJPEGRepresentation(_selectedFile, 1.0);
    //Or you can get the image url from AssetsLibrary
    _filePath = [info valueForKey:UIImagePickerControllerReferenceURL];
    
    [picker dismissViewControllerAnimated:YES completion:^{
        [self updateResultView:[NSString stringWithFormat:@"File selected : %@", _filePath]];
    }];
}

#pragma mark API Commands

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section{
    return [_apiCommnads count];
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath{
    static NSString *CellIdentifier = @"Cell";
    
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier];
    if (cell == nil) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:CellIdentifier];
    }
    
    [cell.textLabel setText:[_apiCommnads objectAtIndex:[indexPath row]]];
    
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath{
    switch ([indexPath row]) {
        case 0:
            [self grantSparkGuestTokenPressed];
            break;
        case 1:
            [self grantSparkAccessTokenPressed];
            break;
        case 2:
            [self uploadFile];
            break;
        case 3:
            [self meshImport];
            break;
        case 4:
            [self meshExport];
            break;
        case 5:
            [self meshAnalysis];
            break;

            
        default:
            break;
    }}


@end
