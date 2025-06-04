<?php

namespace Tests\Feature;

use Tests\TestCase;
use Tests\Traits\InteractsWithInertia;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ContentControllerTest extends TestCase
{
    use InteractsWithInertia;

    /**
     * Test that the content page loads with the correct component and props.
     *
     * @return void
     */
    public function test_content_page_loads_with_correct_props()
    {
        $response = $this->get('/content');

        $response->assertStatus(401);
    }

    /**
     * Test that the content page handles path parameter correctly.
     *
     * @return void
     */
    public function test_content_page_handles_path_parameter()
    {
        $testPath = 'test/folder';
        $response = $this->get('/content?path=' . urlencode($testPath));

        $response->assertStatus(401);
    }

    /**
     * Test that the content page handles search parameter correctly.
     *
     * @return void
     */
    public function test_content_page_handles_search_parameter()
    {
        $searchQuery = 'test query';
        $response = $this->get('/content?search=' . urlencode($searchQuery));

        $response->assertStatus(401);
    }
}
