{ pkgs }: {
	deps = [
   pkgs.gnumake
   pkgs.gcc
   pkgs.python3
   pkgs.speech-tools
   pkgs.ngn-k
		pkgs.nodejs-12_x
		pkgs.nodePackages.typescript-language-server
		pkgs.yarn
		pkgs.replitPackages.jest
	];
}