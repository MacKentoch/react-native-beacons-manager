Pod::Spec.new do |s|
  s.name         = "ReactNativeBeaconsManager"
  s.version      = "1.1.0"
  s.summary      = "React-Native library for detecting beacons (iOS and Android)"
  s.homepage     = "https://github.com/MacKentoch/react-native-beacons-manager#readme"
  s.license      = { :type => "MIT" }
  s.authors      = { "" => "" }
  s.platform     = :ios, "8.0"
  s.source       = { :path => "." }
  s.source_files = "ios", "ios/**/*.{h,m}"

  s.dependency 'React'
end
