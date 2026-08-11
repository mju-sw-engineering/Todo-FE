#!/bin/sh
#
# Xcode Cloud — clone 직후 실행되는 훅.
#
# Xcode Cloud는 리포를 clone만 하고 npm install을 하지 않는다. 그런데
# ios/App/CapApp-SPM/Package.swift가 Capacitor 플러그인을 node_modules 안의
# 로컬 경로로 참조하고(`path: "../../../node_modules/..."`), node_modules는
# gitignore 대상이다. 그래서 깨끗한 clone에는 그 경로가 없다.
#
# 파이프라인 순서가 이렇다.
#   clone → [이 스크립트] → 의존성 해석(SPM) → ci_pre_xcodebuild.sh → xcodebuild
#
# SPM 해석이 이 스크립트 바로 다음이므로, npm install은 반드시 여기서 끝나야 한다.
# ci_pre_xcodebuild.sh에 두면 이미 해석이 끝난 뒤라 늦다.
#
# 위치를 옮겨도(리포 루트 ↔ .xcodeproj 옆) 수정 없이 동작하도록 경로를
# CI_PRIMARY_REPOSITORY_PATH로만 잡는다.

set -e

cd "$CI_PRIMARY_REPOSITORY_PATH"

# Xcode Cloud 이미지에 Node가 포함되지만 버전이 .nvmrc와 다를 수 있다.
# npm ci만 돌리므로 메이저가 맞으면 충분하고, 없을 때만 설치한다.
if ! command -v node > /dev/null 2>&1; then
  echo "node가 없어 Homebrew로 설치한다"
  brew install node@20
  export PATH="$(brew --prefix node@20)/bin:$PATH"
fi

echo "node $(node --version) / npm $(npm --version)"

npm ci

# capacitor.config.json과 ios/App/App/public은 생성물이라 gitignore돼 있다.
# 빌드가 이 둘을 리소스로 참조하므로 clone 후 다시 만들어야 한다.
# CAP_SERVER_URL을 주지 않으므로 capacitor.config.ts의 기본값(운영 주소)이 쓰인다.
npx cap sync ios
