// // // // server.cpp
// // // #define CPPHTTPLIB_OPENSSL_SUPPORT
// // // #include "httplib.h"
// // // #include <windows.h>
// // // #include <mmdeviceapi.h>
// // // #include <audiopolicy.h>
// // // #include <endpointvolume.h>
// // // #include <Audioclient.h>
// // // #include <thread>
// // // #include <chrono>
// // // #include <fstream>

// // // #pragma comment(lib, "ole32.lib")
// // // #pragma comment(lib, "winmm.lib")

// // // bool isWhatsAppInCall() {
// // //     HRESULT hr = CoInitialize(NULL);
// // //     bool result = false;

// // //     IMMDeviceEnumerator* pEnumerator = NULL;
// // //     hr = CoCreateInstance(
// // //         __uuidof(MMDeviceEnumerator), NULL,
// // //         CLSCTX_ALL, __uuidof(IMMDeviceEnumerator),
// // //         (void**)&pEnumerator);

// // //     if (SUCCEEDED(hr)) {
// // //         IMMDevice* pDevice = NULL;
// // //         hr = pEnumerator->GetDefaultAudioEndpoint(eRender, eConsole, &pDevice);

// // //         if (SUCCEEDED(hr)) {
// // //             IAudioSessionManager2* pSessionManager = NULL;
// // //             hr = pDevice->Activate(__uuidof(IAudioSessionManager2),
// // //                 CLSCTX_ALL, NULL, (void**)&pSessionManager);

// // //             if (SUCCEEDED(hr)) {
// // //                 IAudioSessionEnumerator* pSessionEnumerator = NULL;
// // //                 hr = pSessionManager->GetSessionEnumerator(&pSessionEnumerator);

// // //                 if (SUCCEEDED(hr)) {
// // //                     int sessionCount;
// // //                     hr = pSessionEnumerator->GetCount(&sessionCount);

// // //                     for (int i = 0; i < sessionCount; i++) {
// // //                         IAudioSessionControl* pSessionControl = NULL;
// // //                         hr = pSessionEnumerator->GetSession(i, &pSessionControl);

// // //                         if (SUCCEEDED(hr)) {
// // //                             IAudioSessionControl2* pSessionControl2 = NULL;
// // //                             hr = pSessionControl->QueryInterface(
// // //                                 __uuidof(IAudioSessionControl2),
// // //                                 (void**)&pSessionControl2);

// // //                             if (SUCCEEDED(hr)) {
// // //                                 DWORD processId;
// // //                                 hr = pSessionControl2->GetProcessId(&processId);

// // //                                 if (SUCCEEDED(hr)) {
// // //                                     HANDLE hProcess = OpenProcess(
// // //                                         PROCESS_QUERY_LIMITED_INFORMATION,
// // //                                         FALSE, processId);
// // //                                     if (hProcess != NULL) {
// // //                                         WCHAR processName[MAX_PATH];
// // //                                         DWORD size = MAX_PATH;
// // //                                         if (QueryFullProcessImageNameW(
// // //                                             hProcess, 0, processName, &size)) {
// // //                                             std::wstring name(processName);
// // //                                             if (name.find(L"WhatsApp.exe") != std::wstring::npos) {
// // //                                                 IAudioMeterInformation* pMeterInfo = NULL;
// // //                                                 hr = pSessionControl->QueryInterface(
// // //                                                     __uuidof(IAudioMeterInformation),
// // //                                                     (void**)&pMeterInfo);

// // //                                                 if (SUCCEEDED(hr)) {
// // //                                                     float peak;
// // //                                                     hr = pMeterInfo->GetPeakValue(&peak);
// // //                                                     if (SUCCEEDED(hr) && peak > 0.0f) {
// // //                                                         result = true;
// // //                                                     }
// // //                                                     pMeterInfo->Release();
// // //                                                 }
// // //                                             }
// // //                                         }
// // //                                         CloseHandle(hProcess);
// // //                                     }
// // //                                 }
// // //                                 pSessionControl2->Release();
// // //                             }
// // //                             pSessionControl->Release();
// // //                         }
// // //                     }
// // //                     pSessionEnumerator->Release();
// // //                 }
// // //                 pSessionManager->Release();
// // //             }
// // //             pDevice->Release();
// // //         }
// // //         pEnumerator->Release();
// // //     }
// // //     CoUninitialize();
// // //     return result;
// // // }

// // // int main() {
// // //     httplib::Server svr;
// // //     bool lastCallState = false;

// // //     // Serve static files from the current directory
// // //     svr.set_mount_point("/", ".");

// // //     // WebSocket endpoint for call status updates
// // //     svr.ws.on("/ws", [&](const httplib::WebSocket& ws) {
// // //         while (true) {
// // //             bool currentCallState = isWhatsAppInCall();
// // //             if (currentCallState != lastCallState) {
// // //                 lastCallState = currentCallState;
// // //                 std::string message = currentCallState ?
// // //                     "{\"type\":\"callStatus\",\"isActive\":true}" :
// // //                     "{\"type\":\"callStatus\",\"isActive\":false}";
// // //                 ws.send(message);
// // //             }
// // //             std::this_thread::sleep_for(std::chrono::milliseconds(1000));
// // //         }
// // //     });

// // //     printf("Server started on http://localhost:3000\n");
// // //     svr.listen("localhost", 3000);
// // //     return 0;
// // // }

// // // server.cpp
// // #include <windows.h>
// // #include <mmdeviceapi.h>
// // #include <audiopolicy.h>
// // #include <endpointvolume.h>
// // #include <Audioclient.h>
// // #include <winsock2.h>
// // #include <ws2tcpip.h>
// // #include <iostream>
// // #include <thread>
// // #include <chrono>

// // #pragma comment(lib, "ws2_32.lib")
// // #pragma comment(lib, "ole32.lib")
// // #pragma comment(lib, "winmm.lib")

// // bool isWhatsAppInCall() {
// //     HRESULT hr = CoInitialize(NULL);
// //     bool result = false;

// //     IMMDeviceEnumerator* pEnumerator = NULL;
// //     hr = CoCreateInstance(
// //         __uuidof(MMDeviceEnumerator), NULL,
// //         CLSCTX_ALL, __uuidof(IMMDeviceEnumerator),
// //         (void**)&pEnumerator);

// //     if (SUCCEEDED(hr)) {
// //         IMMDevice* pDevice = NULL;
// //         hr = pEnumerator->GetDefaultAudioEndpoint(eRender, eConsole, &pDevice);

// //         if (SUCCEEDED(hr)) {
// //             IAudioSessionManager2* pSessionManager = NULL;
// //             hr = pDevice->Activate(__uuidof(IAudioSessionManager2),
// //                 CLSCTX_ALL, NULL, (void**)&pSessionManager);

// //             if (SUCCEEDED(hr)) {
// //                 IAudioSessionEnumerator* pSessionEnumerator = NULL;
// //                 hr = pSessionManager->GetSessionEnumerator(&pSessionEnumerator);

// //                 if (SUCCEEDED(hr)) {
// //                     int sessionCount;
// //                     hr = pSessionEnumerator->GetCount(&sessionCount);

// //                     for (int i = 0; i < sessionCount; i++) {
// //                         IAudioSessionControl* pSessionControl = NULL;
// //                         hr = pSessionEnumerator->GetSession(i, &pSessionControl);

// //                         if (SUCCEEDED(hr)) {
// //                             IAudioSessionControl2* pSessionControl2 = NULL;
// //                             hr = pSessionControl->QueryInterface(
// //                                 __uuidof(IAudioSessionControl2),
// //                                 (void**)&pSessionControl2);

// //                             if (SUCCEEDED(hr)) {
// //                                 DWORD processId;
// //                                 hr = pSessionControl2->GetProcessId(&processId);

// //                                 if (SUCCEEDED(hr)) {
// //                                     HANDLE hProcess = OpenProcess(
// //                                         PROCESS_QUERY_LIMITED_INFORMATION,
// //                                         FALSE, processId);
// //                                     if (hProcess != NULL) {
// //                                         WCHAR processName[MAX_PATH];
// //                                         DWORD size = MAX_PATH;
// //                                         if (QueryFullProcessImageNameW(
// //                                             hProcess, 0, processName, &size)) {
// //                                             std::wstring name(processName);
// //                                             if (name.find(L"WhatsApp.exe") != std::wstring::npos) {
// //                                                 result = true;
// //                                             }
// //                                         }
// //                                         CloseHandle(hProcess);
// //                                     }
// //                                 }
// //                                 pSessionControl2->Release();
// //                             }
// //                             pSessionControl->Release();
// //                         }
// //                     }
// //                     pSessionEnumerator->Release();
// //                 }
// //                 pSessionManager->Release();
// //             }
// //             pDevice->Release();
// //         }
// //         pEnumerator->Release();
// //     }
// //     CoUninitialize();
// //     return result;
// // }

// // int main() {
// //     // Initialize Winsock
// //     WSADATA wsaData;
// //     if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
// //         std::cout << "WSAStartup failed\n";
// //         return 1;
// //     }

// //     // Create socket
// //     SOCKET listenSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
// //     if (listenSocket == INVALID_SOCKET) {
// //         std::cout << "Socket creation failed\n";
// //         WSACleanup();
// //         return 1;
// //     }

// //     // Setup address structure
// //     sockaddr_in service;
// //     service.sin_family = AF_INET;
// //     service.sin_addr.s_addr = inet_addr("127.0.0.1");
// //     service.sin_port = htons(3000);

// //     // Bind
// //     if (bind(listenSocket, (SOCKADDR*)&service, sizeof(service)) == SOCKET_ERROR) {
// //         std::cout << "Bind failed\n";
// //         closesocket(listenSocket);
// //         WSACleanup();
// //         return 1;
// //     }

// //     // Listen
// //     if (listen(listenSocket, 1) == SOCKET_ERROR) {
// //         std::cout << "Listen failed\n";
// //         closesocket(listenSocket);
// //         WSACleanup();
// //         return 1;
// //     }

// //     std::cout << "Server started on http://localhost:3000\n";

// //     bool lastCallState = false;

// //     while (true) {
// //         SOCKET clientSocket = accept(listenSocket, NULL, NULL);
// //         if (clientSocket != INVALID_SOCKET) {
// //             std::thread([clientSocket]() {
// //                 char recvbuf[512];
// //                 int recvResult = recv(clientSocket, recvbuf, 512, 0);

// //                 // Simple HTTP response
// //                 const char* response = "HTTP/1.1 200 OK\r\n"
// //                                     "Content-Type: text/plain\r\n"
// //                                     "Access-Control-Allow-Origin: *\r\n"
// //                                     "Connection: close\r\n"
// //                                     "\r\n";

// //                 bool inCall = isWhatsAppInCall();
// //                 std::string body = inCall ? "true" : "false";

// //                 send(clientSocket, response, strlen(response), 0);
// //                 send(clientSocket, body.c_str(), body.length(), 0);

// //                 closesocket(clientSocket);
// //             }).detach();
// //         }
// //     }

// //     closesocket(listenSocket);
// //     WSACleanup();
// //     return 0;
// // }

// // minimal_server.cpp
// #include <windows.h>
// #include <winsock2.h>
// #include <iostream>
// #include <psapi.h>
// #include <thread>
// #include <vector>

// #pragma comment(lib, "ws2_32.lib")
// #pragma comment(lib, "psapi.lib")

// bool isWhatsAppRunning() {
//     DWORD processes[1024], cbNeeded;
//     if (!EnumProcesses(processes, sizeof(processes), &cbNeeded)) {
//         return false;
//     }

//     DWORD numProcesses = cbNeeded / sizeof(DWORD);
//     for (DWORD i = 0; i < numProcesses; i++) {
//         if (processes[i] != 0) {
//             HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, processes[i]);
//             if (hProcess != NULL) {
//                 WCHAR processName[MAX_PATH];
//                 if (GetModuleBaseNameW(hProcess, NULL, processName, sizeof(processName) / sizeof(WCHAR))) {
//                     if (wcscmp(processName, L"WhatsApp.exe") == 0) {
//                         CloseHandle(hProcess);
//                         return true;
//                     }
//                 }
//                 CloseHandle(hProcess);
//             }
//         }
//     }
//     return false;
// }

// int main() {
//     // Initialize Winsock
//     WSADATA wsaData;
//     if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
//         std::cout << "WSAStartup failed\n";
//         return 1;
//     }

//     // Create socket
//     SOCKET listenSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
//     if (listenSocket == INVALID_SOCKET) {
//         std::cout << "Socket creation failed\n";
//         WSACleanup();
//         return 1;
//     }

//     // Setup address structure
//     sockaddr_in service;
//     service.sin_family = AF_INET;
//     service.sin_addr.s_addr = inet_addr("127.0.0.1");
//     service.sin_port = htons(3000);

//     // Bind
//     if (bind(listenSocket, (SOCKADDR*)&service, sizeof(service)) == SOCKET_ERROR) {
//         std::cout << "Bind failed\n";
//         closesocket(listenSocket);
//         WSACleanup();
//         return 1;
//     }

//     // Listen
//     if (listen(listenSocket, 1) == SOCKET_ERROR) {
//         std::cout << "Listen failed\n";
//         closesocket(listenSocket);
//         WSACleanup();
//         return 1;
//     }

//     std::cout << "Server started on http://localhost:3000\n";
//     std::cout << "Press Ctrl+C to exit\n";

//     while (true) {
//         SOCKET clientSocket = accept(listenSocket, NULL, NULL);
//         if (clientSocket != INVALID_SOCKET) {
//             std::thread([clientSocket]() {
//                 char recvbuf[512];
//                 int recvResult = recv(clientSocket, recvbuf, 512, 0);

//                 // Simple HTTP response
//                 std::string response = "HTTP/1.1 200 OK\r\n"
//                                     "Content-Type: text/plain\r\n"
//                                     "Access-Control-Allow-Origin: *\r\n"
//                                     "Connection: close\r\n"
//                                     "\r\n";

//                 bool whatsappRunning = isWhatsAppRunning();
//                 response += whatsappRunning ? "true" : "false";

//                 send(clientSocket, response.c_str(), response.length(), 0);
//                 closesocket(clientSocket);
//             }).detach();
//         }

//         Sleep(100); // Small delay to prevent CPU hogging
//     }

//     closesocket(listenSocket);
//     WSACleanup();
//     return 0;
// }

// simple_server.cpp
#include <windows.h>
#include <winsock2.h>
#include <iostream>
#include <psapi.h>

#pragma comment(lib, "ws2_32.lib")
#pragma comment(lib, "psapi.lib")

bool isWhatsAppRunning() {
    DWORD processes[1024], cbNeeded;
    if (!EnumProcesses(processes, sizeof(processes), &cbNeeded)) {
        return false;
    }

    DWORD numProcesses = cbNeeded / sizeof(DWORD);
    for (DWORD i = 0; i < numProcesses; i++) {
        if (processes[i] != 0) {
            HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, processes[i]);
            if (hProcess != NULL) {
                WCHAR processName[MAX_PATH];
                if (GetModuleBaseNameW(hProcess, NULL, processName, sizeof(processName) / sizeof(WCHAR))) {
                    if (wcscmp(processName, L"WhatsApp.exe") == 0) {
                        CloseHandle(hProcess);
                        return true;
                    }
                }
                CloseHandle(hProcess);
            }
        }
    }
    return false;
}

int main() {
    // Initialize Winsock
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        std::cout << "WSAStartup failed\n";
        return 1;
    }

    // Create socket
    SOCKET listenSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (listenSocket == INVALID_SOCKET) {
        std::cout << "Socket creation failed\n";
        WSACleanup();
        return 1;
    }

    // Setup address structure
    sockaddr_in service;
    service.sin_family = AF_INET;
    service.sin_addr.s_addr = inet_addr("127.0.0.1");
    service.sin_port = htons(3000);

    // Bind
    if (bind(listenSocket, (SOCKADDR*)&service, sizeof(service)) == SOCKET_ERROR) {
        std::cout << "Bind failed\n";
        closesocket(listenSocket);
        WSACleanup();
        return 1;
    }

    // Listen
    if (listen(listenSocket, 1) == SOCKET_ERROR) {
        std::cout << "Listen failed\n";
        closesocket(listenSocket);
        WSACleanup();
        return 1;
    }

    std::cout << "Server started on http://localhost:3000\n";
    std::cout << "Press Ctrl+C to exit\n";

    while (true) {
        SOCKET clientSocket = accept(listenSocket, NULL, NULL);
        if (clientSocket != INVALID_SOCKET) {
            char recvbuf[512];
            recv(clientSocket, recvbuf, 512, 0);

            // Simple HTTP response
            std::string response = "HTTP/1.1 200 OK\r\n"
                                 "Content-Type: text/plain\r\n"
                                 "Access-Control-Allow-Origin: *\r\n"
                                 "Connection: close\r\n"
                                 "\r\n";

            bool whatsappRunning = isWhatsAppRunning();
            response += whatsappRunning ? "true" : "false";

            send(clientSocket, response.c_str(), response.length(), 0);
            closesocket(clientSocket);
        }

        Sleep(100); // Small delay to prevent CPU hogging
    }

    closesocket(listenSocket);
    WSACleanup();
    return 0;
}
