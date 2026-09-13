<?php

it('responde el health check /up', function () {
    $this->get('/up')->assertOk();
});
