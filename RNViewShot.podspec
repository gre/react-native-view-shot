require 'json'
version = JSON.parse(File.read('package.json'))["version"]

Pod::Spec.new do |s|

  s.name           = "RNViewShot"
  s.version        = version
  s.summary        = "Capture a React Native view to an image"
  s.homepage       = "https://github.com/gre/react-native-view-shot"
  s.license        = "MIT"
  s.author         = { "Gaëtan Renaudeau" => "renaudeau.gaetan@gmail.com" }
  s.platform       = :ios, "7.0"
  s.source         = { :git => "https://github.com/gre/react-native-view-shot.git", :tag => "v#{s.version}" }
  s.source_files   = 'ios/*.{h,m}'
  s.preserve_paths = "**/*.js"
  s.dependency 'React'

end
