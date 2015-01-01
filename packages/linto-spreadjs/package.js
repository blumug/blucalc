Package.describe({
	summary: "spreadjs-3.20142.13 re-packaged for meteorjs",
	version: "3.20142.14",
	git: "https://github.com/HedCET/linto-spreadjs.git"
});

Package.onUse(function(api) {
  api.versionsFrom('0.9.4');

	api.use("jquery", "client");

	api.add_files("spreadjs-3.20142.13/cobalt/images/ui-bg_flat_0_aaaaaa_40x100.png", "client");
	api.add_files("spreadjs-3.20142.13/cobalt/images/ui-bg_glass_55_b3c4d8_500x100.png", "client");
	api.add_files("spreadjs-3.20142.13/cobalt/images/ui-bg_glass_75_fef1bd_1x400.png", "client");
	api.add_files("spreadjs-3.20142.13/cobalt/images/ui-bg_glass_85_dae6f4_1x400.png", "client");
	api.add_files("spreadjs-3.20142.13/cobalt/images/ui-bg_glass_95_fef1ec_1x400.png", "client");
	api.add_files("spreadjs-3.20142.13/cobalt/images/ui-bg_inset-hard_100_fcfdfd_1x100.png", "client");
	api.add_files("spreadjs-3.20142.13/cobalt/images/ui-bg_inset-hard_100_ffe475_1x100.png", "client");
	api.add_files("spreadjs-3.20142.13/cobalt/images/ui-icons_6e6c56_256x240.png", "client");
	api.add_files("spreadjs-3.20142.13/cobalt/images/ui-icons_469bdd_256x240.png", "client");
	api.add_files("spreadjs-3.20142.13/cobalt/images/ui-icons_cd0a0a_256x240.png", "client");
	api.add_files("spreadjs-3.20142.13/cobalt/images/wijmo-ui-icons_000000_240x112.png", "client");
	api.add_files("spreadjs-3.20142.13/cobalt/images/wijmo-ui-icons_ffffff_240x112.png", "client");

	api.add_files("spreadjs-3.20142.13/cobalt/jquery-wijmo.css", "client");
	api.add_files("spreadjs-3.20142.13/jquery.wijmo.wijspread.3.20142.13.css", "client");

	api.add_files("spreadjs-3.20142.13/jquery.wijmo.wijspread.all.3.20142.13.js", "client");
});
